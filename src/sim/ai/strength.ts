import { BUILDINGS, buildingLevel } from '../../content/buildings';
import { UNITS, type UnitId } from '../../content/units';
import type { Entity, PlayerId } from '../entity';
import type { GameState } from '../state';
import { buildingsOf, isFighter, unitsOf } from './queries';

/**
 * Fighting strength of one unit or armed building: sqrt(hp × damage per second) / 10.
 * The square root makes many weak units count like a few strong ones (Lanchester).
 * Infantry ≈ 3.5, tank ≈ 9, command dome level 1 ≈ 12.
 */
export function unitPower(type: UnitId): number {
  const def = UNITS[type];
  if (!def.cooldownMs) return 0;
  return Math.sqrt(def.hp * ((def.damage * 1000) / def.cooldownMs)) / 10;
}

export function powerOf(e: Entity): number {
  if (e.unit && isFighter(e)) return unitPower(e.unit.type);
  if (e.building && e.building.level >= 1) {
    const lvl = buildingLevel(BUILDINGS[e.building.type], e.building.level);
    if (!lvl.weapon) return 0;
    return Math.sqrt(lvl.hp * ((lvl.weapon.damage * 1000) / lvl.weapon.cooldownMs)) / 10;
  }
  return 0;
}

export function sumPower(list: Entity[]): number {
  return list.reduce((s, e) => s + powerOf(e), 0);
}

/** How far a player has come: the sum of all building levels, plus 2 per research. */
export function progressOf(state: GameState, owner: PlayerId): number {
  const levels = buildingsOf(state, owner).reduce((s, b) => s + (b.building?.level ?? 0), 0);
  return levels + 2 * (state.players[owner]?.research.done.length ?? 0);
}

/** All fighters (anywhere) and armed buildings of a player. */
export function militaryPower(state: GameState, owner: PlayerId): number {
  return sumPower(unitsOf(state, owner)) + sumPower(buildingsOf(state, owner));
}

/** What defends the home planet: armed buildings and fighters there. */
export function homeDefense(state: GameState, owner: PlayerId): number {
  const home = state.players[owner]?.homeBodyId;
  const units = unitsOf(state, owner).filter((u) => u.zone === home);
  return sumPower(units) + sumPower(buildingsOf(state, owner));
}
