import { BUILDINGS } from '../../content/buildings';
import { UNITS } from '../../content/units';
import type { Entity } from '../entity';
import { canHit } from '../layers';
import { hostile } from '../relations';
import type { GameState } from '../state';

/** Distance from a point to the edge of a target (buildings are big). */
export function distanceTo(from: { x: number; y: number }, target: Entity): number {
  if (!target.position) return Infinity;
  const d = Math.hypot(target.position.x - from.x, target.position.y - from.y);
  const radius = target.building ? BUILDINGS[target.building.type].size / 2 : 0;
  return Math.max(0, d - radius);
}

/** Can this thing be shot at all? (Not inside a ship, not a ship in space.) */
export function canBeHit(e: Entity): boolean {
  if (!e.health || !e.position || e.aboard) return false;
  return !e.ship || e.ship.phase === 'docked' || e.ship.phase === 'landed';
}

/** Is b an enemy of a that a may shoot at? Only sides at war (and the wild spiders) fight. */
export function isEnemy(state: GameState, a: Entity, b: Entity): boolean {
  return a.zone === b.zone && hostile(state, a.owner, b.owner) && canBeHit(b);
}

/** Units notice enemies a bit further away than they can shoot. */
export function aggroRange(unit: Entity): number {
  return Math.max(5, (unit.attacker?.range ?? 0) + 1.5);
}

/** Lower is more interesting: fighters first, then other units, then buildings. */
function score(unit: Entity, other: Entity, d: number): number {
  const breaker = !!unit.unit && !!UNITS[unit.unit.type].prefersBuildings;
  if (other.building) return d + (other.attacker ? 1 : breaker ? 0 : 4);
  return d + (other.attacker ? 0 : 2);
}

/** Things that can be shot, grouped by zone. Built once per combat step. */
export function targetsByZone(state: GameState): Map<string, Entity[]> {
  const out = new Map<string, Entity[]>();
  for (const e of state.world.with('health', 'position')) {
    if (e.egg || e.nest || !e.zone || !canBeHit(e)) continue;
    const list = out.get(e.zone);
    if (list) list.push(e);
    else out.set(e.zone, [e]);
  }
  return out;
}

/** Closest enemy worth shooting within maxDist. Eggs and nests only on purpose. */
export function nearestEnemy(
  state: GameState,
  unit: Entity,
  maxDist: number,
  candidates: readonly Entity[],
): Entity | undefined {
  if (!unit.position) return undefined;
  let best: Entity | undefined;
  let bestScore = Infinity;
  for (const other of candidates) {
    if (!isEnemy(state, unit, other) || !canHit(unit, other)) continue;
    const d = distanceTo(unit.position, other);
    if (d > maxDist) continue;
    const s = score(unit, other, d);
    if (s < bestScore) [best, bestScore] = [other, s];
  }
  return best;
}
