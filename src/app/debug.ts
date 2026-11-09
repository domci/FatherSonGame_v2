import { findEntity, spawnBuilding, spawnUnit } from '../sim/spawn';
import type { Session } from './session';
import type { Projector } from './screen-pos';
import type { ViewManager } from '../render/view-manager';

/**
 * Small helper for automatic browser tests (Playwright):
 * window.gameDebug.screenOf(x, y) gives the pixel position of a surface point.
 */
export function exposeDebug(session: Session, project: Projector, views: ViewManager): void {
  const api = {
    session,
    views,
    /** For test scenes (battles): put units and buildings on the map directly. */
    spawnUnit: (...a: Parameters<typeof spawnUnit>) => spawnUnit(...a),
    spawnBuilding: (...a: Parameters<typeof spawnBuilding>) => spawnBuilding(...a),
    screenOf: (x: number, y: number) => project(x, y),
    screenOfEntity: (id: number) => {
      const p = findEntity(session.state, id)?.position;
      return p ? project(p.x, p.y) : null;
    },
  };
  (window as unknown as { gameDebug: typeof api }).gameDebug = api;
}
