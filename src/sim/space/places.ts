import type { Entity, PlayerId, Vec2 } from '../entity';
import { BELT_ID, bodyPosition, findBody } from '../generation/solar-system';
import type { GameState } from '../state';
import { SECOND } from '../clock';
import { enemyOf } from '../names';

/** Flight time per map unit at speed 1 (like the mining ships). */
const MS_PER_UNIT = 4 * SECOND;

/** Is this a place a fleet can fly to (a planet or the belt)? */
export function isPlace(state: GameState, id: string): boolean {
  return id === BELT_ID || !!findBody(state.system, id);
}

/** Distance from the sun of a place (the belt: its middle). */
function radiusOf(state: GameState, id: string): number {
  if (id === BELT_ID) return (state.system.belt.inner + state.system.belt.outer) / 2;
  return findBody(state.system, id)?.orbitRadius ?? 0;
}

/** Where a place is now (the belt: the point closest to `near`). */
export function placePos(state: GameState, id: string, near?: Vec2): Vec2 {
  const body = findBody(state.system, id);
  if (body) return bodyPosition(body, state.time);
  const r = radiusOf(state, id);
  const a = near ? Math.atan2(near.y, near.x) : 0;
  return { x: Math.cos(a) * r, y: Math.sin(a) * r };
}

/** Flight time between two places for a ship of this speed (measured at the start). */
export function spaceTravelMs(state: GameState, from: string, to: string, speed: number): number {
  let dist: number;
  if (from === BELT_ID || to === BELT_ID) {
    dist = Math.abs(radiusOf(state, from) - radiusOf(state, to)) + 2;
  } else {
    const a = placePos(state, from);
    const b = placePos(state, to);
    dist = Math.hypot(a.x - b.x, a.y - b.y);
  }
  return Math.round((dist * MS_PER_UNIT) / Math.max(0.1, speed));
}

/** All war ships. */
export function warships(state: GameState): Entity[] {
  return state.world.with('orbit').entities;
}

/** War ships that wait at a place (not flying). */
export function shipsAt(state: GameState, place: string, owner?: PlayerId): Entity[] {
  return warships(state).filter(
    (e) => e.orbit?.at === place && !e.orbit.to && (!owner || e.owner === owner),
  );
}

/** Enemy war ships that wait at a place: they block it. */
export function blockers(state: GameState, owner: PlayerId, place: string): Entity[] {
  return shipsAt(state, place, enemyOf(owner));
}
