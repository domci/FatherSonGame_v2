import { BUILDINGS, type BuildingId } from '../../content/buildings';
import type { Faction } from '../../content/factions';
import { HUMAN_BUILDINGS } from './building-specs';
import type { KitPart, ModelPart } from './parts';
import { ALIEN_BUILDINGS } from './specs-alien';

/**
 * Human buildings where people live and work sit under a glass dome (no air outside).
 * The number is the dome height as a share of its radius.
 */
const DOMES: Partial<Record<BuildingId, number>> = {
  commandDome: 0.62,
  habitatDome: 0.72,
  storage: 0.95,
  waterOxygenPlant: 0.8,
  greenhouse: 0.75,
  huntingLodge: 0.8,
  lab: 0.85,
  barracks: 1.05,
  vehicleFactory: 0.95,
  medbay: 0.85,
  park: 0.62,
};

/** A geodesic glass dome with a steel frame, foot ring and airlock (Blender model 'dome'). */
export function glassDome(size: number, height: number): KitPart[] {
  const r = size * 0.49;
  return [{ kit: 'dome', scale: [r, r * height, r], pos: [0, 0.06, 0] }];
}

/** The parts of a building model in the look of a people. */
export function buildingParts(type: BuildingId, faction: Faction): readonly ModelPart[] {
  if (faction === 'alien') return ALIEN_BUILDINGS[type];
  const dome = DOMES[type];
  const parts = HUMAN_BUILDINGS[type];
  return dome ? [...parts, ...glassDome(BUILDINGS[type].size, dome)] : parts;
}
