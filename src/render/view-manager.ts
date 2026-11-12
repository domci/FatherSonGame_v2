import { viewerHome, viewerOf } from '../sim/viewer';
import { Vector2 } from 'three/webgpu';
import type { GameState } from '../sim/state';
import { canViewSurface } from '../sim/visibility';
import type { GameRenderer } from './renderer';
import { SpaceView } from './views/space-view';
import { SurfaceView } from './views/surface-view';
import type { View, ViewName, ViewUi } from './views/view';
import { levelOf, spaceShare, Z_MAX, Z_NO_SURFACE, Z_REST } from './zoom';

/** Zoom per wheel pixel and per pinch pixel. */
const WHEEL = 0.0014;
const PINCH = 0.006;
/** How fast the zoom follows the wheel (per second). */
const FOLLOW = 7;
/** A flight to another planet first goes this far out. */
const FLY_OUT = 2.3;

interface Flight {
  zone: string;
  focus?: { x: number; y: number };
}

/**
 * One continuous zoom from the ground to the whole solar system (see zoom.ts).
 * Surface and space are two scenes; around the planet level both are drawn and mixed.
 */
export class ViewManager {
  readonly space: SpaceView;
  private surfaces = new Map<string, SurfaceView>();
  private current: SurfaceView;
  private z = Z_REST.surface;
  private goal = Z_REST.surface;
  private focusId: string;
  private flight?: Flight;
  private activeName: ViewName = 'surface';
  private lastPinch = 0;
  private state: GameState;
  onChange?: (name: ViewName) => void;
  /** The planet whose surface is shown below the camera changed. */
  onZone?: (zone: string) => void;

  constructor(
    state: GameState,
    private gr: GameRenderer,
    private canvas: HTMLCanvasElement,
  ) {
    this.state = state;
    this.focusId = viewerHome(state);
    const surface = this.surfaceFor(this.focusId);
    if (!surface) throw new Error('home surface missing');
    this.current = surface;
    const faction = state.players[viewerOf(state)]?.faction ?? 'human';
    this.space = new SpaceView(state.system, faction, canvas);
    this.setActive('surface');
    canvas.addEventListener('wheel', (e) => this.onWheel(e), { passive: true });
    canvas.addEventListener('touchmove', (e) => this.onTouch(e), { passive: true });
    canvas.addEventListener('touchend', () => (this.lastPinch = 0), { passive: true });
  }

  /** The view that taps go to. */
  get active(): View {
    return this.z < 1 ? this.current : this.space;
  }

  /** The surface view that shows the planet below the camera. */
  get surface(): SurfaceView {
    return this.current;
  }

  /** Zooms smoothly to a level (buttons in the HUD). */
  go(name: ViewName): void {
    if (name === 'surface' && !this.canLand(this.focusId)) {
      this.flyTo(viewerHome(this.state));
      return;
    }
    this.goal = Z_REST[name];
  }

  /** Flies to a planet's surface: out, over to the planet, and down. */
  flyTo(zone: string, focus?: { x: number; y: number }): void {
    if (zone === this.focusId || this.z >= FLY_OUT) {
      this.setFocus(zone, focus);
      this.goal = this.canLand(zone) ? Z_REST.surface : Z_REST.planet;
      return;
    }
    this.flight = { zone, focus };
    this.goal = Math.max(this.goal, FLY_OUT + 0.05);
  }

  frame(state: GameState, ui: ViewUi, dtMs: number): void {
    this.state = state;
    this.goal = Math.min(Z_MAX, Math.max(this.minZoom(), this.goal));
    this.z += (this.goal - this.z) * (1 - Math.exp((-dtMs / 1000) * FOLLOW));
    if (Math.abs(this.goal - this.z) < 0.001) this.z = this.goal;
    if (this.flight && this.z >= FLY_OUT) this.land(this.flight);
    const level = levelOf(this.z);
    if (level !== this.activeName) this.setActive(level);
    const share = spaceShare(this.z);
    if (share < 1) {
      this.current.setZoom(this.z);
      this.current.update(state, ui, dtMs);
    }
    if (share > 0) {
      this.space.setZoom(this.z, this.focusId);
      this.space.update(state, ui, dtMs);
    }
    const [a, b] = [this.current, this.space];
    if (share <= 0) this.gr.render(a.scene, a.camera);
    else if (share >= 1) this.gr.render(b.scene, b.camera);
    else this.gr.renderMix(a, b, share);
  }

  resize(width: number, height: number): void {
    this.gr.resize(width, height);
    const aspect = width / Math.max(1, height);
    for (const v of [this.space, ...this.surfaces.values()]) v.resize(aspect);
  }

  private canLand(zone: string): boolean {
    return canViewSurface(this.state, viewerOf(this.state), zone);
  }

  private minZoom(): number {
    return this.canLand(this.focusId) ? 0 : Z_NO_SURFACE;
  }

  private land(flight: Flight): void {
    this.flight = undefined;
    this.setFocus(flight.zone, flight.focus);
    this.goal = this.canLand(flight.zone) ? Z_REST.surface : Z_REST.planet;
  }

  /** The planet the camera flies to. Its surface (if any) is the one below the camera. */
  private setFocus(zone: string, focus?: { x: number; y: number }): void {
    this.focusId = zone;
    const next = this.surfaceFor(zone);
    if (!next) return;
    if (focus) next.focus(focus.x, focus.y);
    if (next === this.current) return;
    this.current.setEnabled(false);
    this.current = next;
    next.setEnabled(this.activeName === 'surface');
    this.onZone?.(zone);
  }

  /** One surface view per planet, made when it is first needed. */
  private surfaceFor(zone: string): SurfaceView | undefined {
    const old = this.surfaces.get(zone);
    if (old) return old;
    const map = this.state.surfaces[zone];
    if (!map) return undefined;
    const view = new SurfaceView(map, this.canvas);
    const { width, height } = this.canvas.getBoundingClientRect();
    view.resize(width / Math.max(1, height));
    view.setEnabled(false);
    this.surfaces.set(zone, view);
    return view;
  }

  private setActive(name: ViewName): void {
    this.activeName = name;
    this.current.setEnabled(name === 'surface');
    this.space.setEnabled(name !== 'surface');
    this.onChange?.(name);
  }

  /** Zooming in over the solar system flies to the planet under the mouse. */
  private onWheel(e: WheelEvent): void {
    const delta = e.deltaY * (e.deltaMode === 1 ? 16 : 1);
    if (delta === 0) return;
    if (delta < 0 && this.z >= 2) this.aimAt(e.clientX, e.clientY);
    this.goal += delta * WHEEL;
  }

  private aimAt(x: number, y: number): void {
    const r = this.canvas.getBoundingClientRect();
    const ndc = new Vector2(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
    const pick = this.space.pick(this.state, ndc);
    const body = pick?.kind === 'body' && this.state.system.bodies.find((b) => b.id === pick.id);
    if (body && body.id !== this.focusId) this.setFocus(body.id);
  }

  private onTouch(e: TouchEvent): void {
    const [a, b] = [e.touches[0], e.touches[1]];
    if (!a || !b) return;
    const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    if (this.lastPinch) {
      if (dist > this.lastPinch && this.z >= 2)
        this.aimAt((a.clientX + b.clientX) / 2, (a.clientY + b.clientY) / 2);
      this.goal += (this.lastPinch - dist) * PINCH;
    }
    this.lastPinch = dist;
  }
}
