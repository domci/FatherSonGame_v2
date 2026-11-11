import { BUILDINGS, type BuildingId } from '../../content/buildings';
import type { Faction } from '../../content/factions';
import { HUMAN_BUILDINGS } from './building-specs';
import type { ModelPart, Part } from './parts';
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

/** A glass dome with steel ribs over a round foot ring. */
export function glassDome(size: number, height: number): Part[] {
  const r = size * 0.49;
  const s: [number, number, number] = [1, height, 1];
  const rib = (turn: number): Part => ({
    shape: 'arc',
    size: [r, 0.022, Math.PI],
    pos: [0, 0.1, 0],
    rot: [0, turn, 0],
    scale: s,
    mat: 'steel',
  });
  return [
    { shape: 'dome', size: [r], pos: [0, 0.1, 0], scale: s, mat: 'domeGlass' },
    rib(0),
    rib(Math.PI / 2),
    rib(Math.PI / 4),
    rib(-Math.PI / 4),
    { shape: 'torus', size: [r, 0.06], pos: [0, 0.12, 0], rot: [Math.PI / 2, 0, 0], mat: 'white' },
    { shape: 'cyl', size: [0.12, 0.06], pos: [0, 0.1 + r * height, 0], mat: 'steel' },
  ];
}

/** The parts of a building model in the look of a people. */
export function buildingParts(type: BuildingId, faction: Faction): readonly ModelPart[] {
  if (faction === 'alien') return ALIEN_BUILDINGS[type];
  const dome = DOMES[type];
  const parts = HUMAN_BUILDINGS[type];
  return dome ? [...parts, ...glassDome(BUILDINGS[type].size, dome)] : parts;
}
