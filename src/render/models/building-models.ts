import type { BuildingId } from '../../content/buildings';
import type { Faction } from '../../content/factions';
import { HUMAN_BUILDINGS } from './building-specs';
import type { ModelPart } from './parts';
import { ALIEN_BUILDINGS } from './specs-alien';

/** The parts of a building model in the look of a people. */
export function buildingParts(type: BuildingId, faction: Faction): readonly ModelPart[] {
  return faction === 'alien' ? ALIEN_BUILDINGS[type] : HUMAN_BUILDINGS[type];
}
