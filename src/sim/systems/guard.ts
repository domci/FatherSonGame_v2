import type { Entity, PlayerId } from '../entity';
import { sendTo } from '../commands/units';
import type { GameState, PlayerState } from '../state';
import { canHit } from '../layers';
import { hasFuel, needsFuel } from './fuel';
import { distanceTo, isEnemy } from './targeting';

/** Enemies this close to an own building raise the alarm (tiles). */
export const ALARM_RANGE = 14;
/** The guard checks once per second. */
const CHECK_MS = 1000;

function isIdleFighter(u: Entity): boolean {
  return (
    !!u.unit && !!u.attacker && u.unit.type !== 'spider' && !u.ship && !u.aboard && !u.busyWith
  );
}

/** Enemy units near the buildings of `owner` on its home planet. */
function intruders(state: GameState, owner: PlayerId, home: string, own: Entity[]): Entity[] {
  const buildings = own.filter((e) => e.building);
  if (buildings.length === 0) return [];
  return state.world
    .with('unit', 'position')
    .entities.filter(
      (e) =>
        e.zone === home &&
        isEnemy(state, buildings[0] ?? e, e) &&
        buildings.some((b) => b.position && distanceTo(b.position, e) <= ALARM_RANGE + 2),
    );
}

function nearest(from: Entity, list: Entity[]): Entity | undefined {
  let best: Entity | undefined;
  let bestD = Infinity;
  for (const e of list) {
    const d = from.position ? distanceTo(from.position, e) : Infinity;
    if (d < bestD) [best, bestD] = [e, d];
  }
  return best;
}

/** Walks to a point and fights everything on the way. */
function charge(state: GameState, u: Entity, to: { x: number; y: number }): void {
  if (!sendTo(state, u, to)) return;
  const mover: Entity['mover'] = u.mover;
  if (mover) mover.attackMove = true;
}

/**
 * When enemies come near the base, soldiers at home that stand around
 * go to them and fight (attack-move). Soldiers with an order keep their order.
 */
export function guardSystem(state: GameState, dtMs: number): void {
  if (Math.floor(state.time / CHECK_MS) === Math.floor((state.time - dtMs) / CHECK_MS)) return;
  for (const player of Object.values(state.players)) if (player) guard(state, player);
}

function guard(state: GameState, player: PlayerState): void {
  const own = state.world
    .with('position')
    .entities.filter((e) => e.owner === player.id && e.zone === player.homeBodyId);
  const enemies = intruders(state, player.id, player.homeBodyId, own);
  if (enemies.length === 0) return;
  const fuel = hasFuel(state, player.id);
  for (const u of own) {
    if (!isIdleFighter(u) || u.mover || u.attacker?.targetId) continue;
    if (needsFuel(u) && !fuel) continue;
    const target = nearest(
      u,
      enemies.filter((e) => canHit(u, e)),
    );
    if (target?.position) charge(state, u, target.position);
  }
}
