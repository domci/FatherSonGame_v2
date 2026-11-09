import { Vector3 } from 'three/webgpu';
import type { ViewManager } from '../render/view-manager';
import { visualHeight } from '../render/terrain-shape';
import type { Session } from './session';

export type Projector = (x: number, y: number, lift?: number) => { x: number; y: number } | null;

/** Turns a point on the shown surface into a pixel position on the screen (null if not visible). */
export function makeProjector(
  session: Session,
  views: ViewManager,
  canvas: HTMLCanvasElement,
): Projector {
  const v = new Vector3();
  return (x, y, lift = 0) => {
    const map = session.state.surfaces[session.ui.zone];
    if (!map || session.ui.view !== 'surface') return null;
    v.set(x - map.size / 2, visualHeight(map, x, y) + lift, y - map.size / 2);
    v.project(views.active.camera);
    if (v.z > 1) return null;
    const r = canvas.getBoundingClientRect();
    return { x: r.left + ((v.x + 1) / 2) * r.width, y: r.top + ((1 - v.y) / 2) * r.height };
  };
}
