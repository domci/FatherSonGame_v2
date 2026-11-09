import { Vector3 } from 'three/webgpu';

const SPEED = 0.006;
const MIN_PHI = 0.06;

/**
 * Turning the space camera with one finger or the mouse.
 * The direction is from what the camera looks at to the camera (theta around, phi from top).
 */
export class SpaceOrbit {
  theta = 0.4;
  phi = 1.0;
  enabled = false;
  /** Largest phi (the system view does not go below the planets' plane). */
  maxPhi = Math.PI - MIN_PHI;
  private last: { x: number; y: number; id: number } | null = null;
  private touches = new Set<number>();

  constructor(dom: HTMLElement) {
    dom.addEventListener('pointerdown', (e) => {
      this.touches.add(e.pointerId);
      this.last = this.touches.size === 1 ? { x: e.clientX, y: e.clientY, id: e.pointerId } : null;
    });
    const up = (e: PointerEvent): void => {
      this.touches.delete(e.pointerId);
      if (this.last?.id === e.pointerId) this.last = null;
    };
    dom.addEventListener('pointerup', up);
    dom.addEventListener('pointercancel', up);
    dom.addEventListener('pointermove', (e) => this.move(e));
  }

  /** The unit vector from the look point to the camera. */
  direction(out = new Vector3()): Vector3 {
    this.phi = Math.min(this.maxPhi, Math.max(MIN_PHI, this.phi));
    return out.setFromSphericalCoords(1, this.phi, this.theta);
  }

  /** Points the camera along a direction (used to turn toward the base). */
  setDirection(dir: Vector3): void {
    const d = dir.clone().normalize();
    this.phi = Math.acos(Math.min(1, Math.max(-1, d.y)));
    this.theta = Math.atan2(d.x, d.z);
  }

  private move(e: PointerEvent): void {
    if (!this.last || this.last.id !== e.pointerId || e.buttons === 0) return;
    const [dx, dy] = [e.clientX - this.last.x, e.clientY - this.last.y];
    this.last = { x: e.clientX, y: e.clientY, id: e.pointerId };
    if (!this.enabled) return;
    this.theta -= dx * SPEED;
    this.phi -= dy * SPEED;
  }
}
