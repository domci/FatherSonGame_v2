import { BUILDINGS, type BuildingId } from '../../content/buildings';
import { UNITS, type UnitId } from '../../content/units';
import type { Entity, PlayerId } from '../entity';
import type { GameState } from '../state';

export function buildingsOf(state: GameState, owner: PlayerId, type?: BuildingId): Entity[] {
  return state.world
    .with('building')
    .entities.filter((b) => b.owner === owner && (!type || b.building.type === type));
}

export function coreOf(state: GameState, owner: PlayerId): Entity | undefined {
  return buildingsOf(state, owner, 'commandDome')[0];
}

export function unitsOf(state: GameState, owner: PlayerId, type?: UnitId): Entity[] {
  return state.world
    .with('unit')
    .entities.filter((u) => u.owner === owner && (!type || u.unit.type === type));
}

/** Units of this type, including the ones still in training queues. */
export function unitCount(state: GameState, owner: PlayerId, type: UnitId): number {
  let n = unitsOf(state, owner, type).length;
  for (const b of state.world.with('training')) {
    if (b.owner !== owner) continue;
    n += [b.training.unit, ...b.training.queue].filter((u) => u === type).length;
  }
  return n;
}

/** A finished building that can train this unit and is not too busy. */
export function trainerFor(state: GameState, owner: PlayerId, unit: UnitId): Entity | undefined {
  return buildingsOf(state, owner).find(
    (b) =>
      b.building &&
      b.building.level >= 1 &&
      !b.construction &&
      (BUILDINGS[b.building.type].trains ?? []).includes(unit) &&
      (b.training?.queue.length ?? 0) < 2,
  );
}

export function isFighter(u: Entity): boolean {
  return !!u.unit && !!u.attacker && u.unit.type !== 'spider' && !u.aboard;
}

export function housingOf(units: Entity[]): number {
  return units.reduce((s, u) => s + (u.unit ? UNITS[u.unit.type].housing : 0), 0);
}
