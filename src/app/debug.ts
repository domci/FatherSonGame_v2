import { findEntity } from '../sim/spawn';
import type { Session } from './session';
import type { Projector } from './screen-pos';

/**
 * Small helper for automatic browser tests (Playwright):
 * window.gameDebug.screenOf(x, y) gives the pixel position of a surface point.
 */
export function exposeDebug(session: Session, project: Projector): void {
  const api = {
    session,
    screenOf: (x: number, y: number) => project(x, y),
    screenOfEntity: (id: number) => {
      const p = findEntity(session.state, id)?.position;
      return p ? project(p.x, p.y) : null;
    },
  };
  (window as unknown as { gameDebug: typeof api }).gameDebug = api;
}
