import type { BuildingId } from '../content/buildings';
import { buildingName, unitName, type Faction } from '../content/factions';
import type { UnitId } from '../content/units';
import type { PlayerId } from './entity';
import type { GameState } from './state';
import type { Loc } from '../content/text';

export function factionOf(state: GameState, owner: PlayerId | undefined): Faction {
  return (owner && state.players[owner]?.faction) || 'human';
}

/** Building name in the language of its owner's people. */
export function nameOfBuilding(state: GameState, owner: PlayerId | undefined, id: BuildingId): Loc {
  return buildingName(id, factionOf(state, owner));
}

export function nameOfUnit(state: GameState, owner: PlayerId | undefined, id: UnitId): Loc {
  return unitName(id, factionOf(state, owner));
}
