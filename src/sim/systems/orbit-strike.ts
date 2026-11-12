import { BUILDINGS, buildingLevel } from '../../content/buildings';
import { UNITS } from '../../content/units';
import { addEvent, nextRandom } from '../game';
import type { Entity } from '../entity';
import { hostile } from '../relations';
import { hasResearch } from '../research-helpers';
import { blockers, warships } from '../space/places';
import type { GameState } from '../state';
import { dealDamage } from './damage';

/** Time between two shots from orbit of one ship. */
export const STRIKE_MS = 4000;
/** The player hears the alarm at most this often. */
const ALARM_MS = 60_000;

const lastAlarm = new WeakMap<GameState, number>();

function alarm(state: GameState): void {
  const last = lastAlarm.get(state) ?? -Infinity;
  if (state.time - last < ALARM_MS) return;
  lastAlarm.set(state, state.time);
  addEvent(state, 'Angriff aus dem Orbit! Schilde und Orbitalkanonen helfen.', 'bad');
}

/** Cannons that shoot into orbit first, then any building. */
function pickTarget(state: GameState, list: Entity[]): Entity | undefined {
  const cannon = list.find((b) => b.building?.type === 'orbitalCannon');
  if (cannon) return cannon;
  return list[Math.floor(nextRandom(state) * list.length)];
}

function armor(b: Entity): number {
  if (!b.building || b.building.level < 1) return 0;
  return buildingLevel(BUILDINGS[b.building.type], b.building.level).armor ?? 0;
}

function strike(state: GameState, ship: Entity, place: string, power: number): void {
  const owner = ship.owner;
  if (!owner) return;
  const list = state.world
    .with('building', 'position')
    .entities.filter((b) => b.zone === place && hostile(state, owner, b.owner));
  const target = pickTarget(state, list);
  if (!target?.position) return;
  const { x, y } = target.position;
  state.marks.push({ time: state.time, zone: place, x, y, kind: 'strike', owner: ship.owner });
  const victim = target.owner;
  dealDamage(state, target, Math.max(1, power - armor(target)), ship);
  if (victim === 'player') alarm(state);
}

/**
 * Cruisers with the Orbitallaser shoot at enemy buildings below them.
 * Only when no enemy war ship guards that orbit. Shields catch the shots.
 */
export function orbitStrikeSystem(state: GameState): void {
  for (const ship of warships(state)) {
    const o = ship.orbit;
    const power = ship.unit ? UNITS[ship.unit.type].orbitStrike : undefined;
    if (!o || o.to || !power || !ship.owner) continue;
    if (!hasResearch(state, ship.owner, 'orbitalLaser') || !state.surfaces[o.at]) continue;
    if (blockers(state, ship.owner, o.at).length > 0) continue;
    if ((o.strikeAt ?? 0) > state.time) continue;
    o.strikeAt = state.time + STRIKE_MS;
    strike(state, ship, o.at, power);
  }
}
