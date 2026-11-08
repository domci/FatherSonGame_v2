import type { Entity } from '../../sim/entity';
import {
  BELT_ID,
  bodyPosition,
  findBody,
  type SolarSystem,
} from '../../sim/generation/solar-system';
import type { GameState } from '../../sim/state';

export interface ShipPose {
  x: number;
  y: number;
  angle: number;
}

function targetPos(
  system: SolarSystem,
  targetId: string,
  homePos: { x: number; y: number },
  time: number,
) {
  if (targetId === BELT_ID) {
    const mid = (system.belt.inner + system.belt.outer) / 2;
    const a = Math.atan2(homePos.y, homePos.x);
    return { x: Math.cos(a) * mid, y: Math.sin(a) * mid };
  }
  const body = findBody(system, targetId);
  return body ? bodyPosition(body, time) : homePos;
}

/** Where a mining ship is in the solar system right now (for drawing only). */
export function shipPose(state: GameState, ship: Entity): ShipPose | null {
  const data = ship.ship;
  const homeId = ship.owner ? state.players[ship.owner]?.homeBodyId : undefined;
  const home = homeId ? findBody(state.system, homeId) : undefined;
  if (!data || !home || data.phase === 'docked' || !data.targetBodyId) return null;
  const h = bodyPosition(home, state.time);
  const t = targetPos(state.system, data.targetBodyId, h, state.time);
  const span = Math.max(1, data.phaseEndsAt - data.phaseStartAt);
  const p = Math.min(1, Math.max(0, (state.time - data.phaseStartAt) / span));
  if (data.phase === 'mining')
    return { x: t.x + Math.cos(p * 20) * 0.8, y: t.y + Math.sin(p * 20) * 0.8, angle: p * 20 };
  const [from, to] = data.phase === 'outbound' ? [h, t] : [t, h];
  return {
    x: from.x + (to.x - from.x) * p,
    y: from.y + (to.y - from.y) * p,
    angle: Math.atan2(to.x - from.x, to.y - from.y),
  };
}
