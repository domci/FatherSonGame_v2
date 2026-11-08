import type { GameState } from '../sim/state';
import type { GameRenderer } from './renderer';
import { PlanetView } from './views/planet-view';
import { SurfaceView } from './views/surface-view';
import { SystemView } from './views/system-view';
import type { View, ViewName, ViewUi } from './views/view';

const ORDER: ViewName[] = ['surface', 'planet', 'system'];
const LIMIT_HITS = 3;

/** Holds the three zoom levels and switches between them with a short fade. */
export class ViewManager {
  private views: Record<ViewName, View>;
  private activeName: ViewName = 'surface';
  private limitHits = 0;
  private lastPinch = 0;
  onChange?: (name: ViewName) => void;

  constructor(
    state: GameState,
    private gr: GameRenderer,
    private canvas: HTMLCanvasElement,
    private fade: HTMLElement,
  ) {
    const map = state.surfaces[state.system.homeBodyId];
    if (!map) throw new Error('home surface missing');
    this.views = {
      surface: new SurfaceView(map, canvas),
      planet: new PlanetView(state.system, canvas),
      system: new SystemView(state.system, canvas),
    };
    this.setActive('surface');
    canvas.addEventListener('wheel', (e) => this.onWheel(e.deltaY), { passive: true });
    canvas.addEventListener('touchmove', (e) => this.onTouch(e), { passive: true });
  }

  get active(): View {
    return this.views[this.activeName];
  }

  go(name: ViewName): void {
    if (name === this.activeName) return;
    const outward = ORDER.indexOf(name) > ORDER.indexOf(this.activeName);
    this.fade.classList.add('on');
    window.setTimeout(() => {
      this.setActive(name);
      this.views[name].resetZoom(outward ? 0 : 1);
      this.fade.classList.remove('on');
    }, 180);
  }

  frame(state: GameState, ui: ViewUi, dtMs: number): void {
    this.active.update(state, ui, dtMs);
    this.gr.render(this.active.scene, this.active.camera);
  }

  resize(width: number, height: number): void {
    this.gr.resize(width, height);
    for (const v of Object.values(this.views)) v.resize(width / Math.max(1, height));
  }

  private setActive(name: ViewName): void {
    for (const [n, v] of Object.entries(this.views)) v.setEnabled(n === name);
    this.activeName = name;
    this.limitHits = 0;
    this.onChange?.(name);
  }

  private step(dir: 1 | -1): void {
    const level = this.active.zoomLevel();
    const atLimit = dir > 0 ? level >= 0.97 : level <= 0.03;
    this.limitHits = atLimit ? this.limitHits + 1 : 0;
    if (this.limitHits < LIMIT_HITS) return;
    const next = ORDER[ORDER.indexOf(this.activeName) + dir];
    if (next) this.go(next);
  }

  private onWheel(deltaY: number): void {
    if (deltaY !== 0) this.step(deltaY > 0 ? 1 : -1);
  }

  private onTouch(e: TouchEvent): void {
    const [a, b] = [e.touches[0], e.touches[1]];
    if (!a || !b) return;
    const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    if (this.lastPinch && Math.abs(dist - this.lastPinch) > 4)
      this.step(dist < this.lastPinch ? 1 : -1);
    this.lastPinch = dist;
  }
}
