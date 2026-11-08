import type { BuildingId } from '../../content/buildings';
import type { ModelPart, Part } from './parts';
import { ADVANCED_SPECS } from './specs-advanced';
import { cornerLights, pad, row } from './specs-helpers';

const Y = 0.1; // top of the landing pad

const commandDome: ModelPart[] = [
  pad(4),
  ...cornerLights(4),
  { kit: 'hangar_roundGlass', pos: [-0.4, Y, 0.35], scale: 1, mats: { dark: 'glass' } },
  { shape: 'sphere', size: [0.32], pos: [-0.9, 0.45, 0.55], mat: 'plant' },
  { shape: 'sphere', size: [0.25], pos: [0.1, 0.4, 0.8], mat: 'plant' },
  { shape: 'box', size: [0.6, 0.55, 0.6], pos: [-0.3, 0.38, -0.1], mat: 'white' },
  { shape: 'box', size: [0.3, 0.08, 0.02], pos: [-0.3, 0.5, 0.21], mat: 'window' },
  { kit: 'craft_cargoA', pos: [1.3, 0.25, -1.05], rot: [0.18, 0.75, 0.32], scale: 1.05 },
  { kit: 'rocks_smallB', pos: [1.6, Y, -0.1], scale: 1.1 },
  { kit: 'satelliteDish_large', pos: [-1.45, Y, -1.4], scale: 1.1, rot: [0, 0.6, 0] },
  { kit: 'machine_wireless', pos: [1.4, Y, 1.4], scale: 0.9, rot: [0, -0.8, 0] },
  { kit: 'barrels', pos: [-1.55, Y, 1.5], scale: 1 },
];

const panel = (x: number): Part[] => [
  { shape: 'box', size: [0.62, 0.04, 1.6], pos: [x, 0.62, 0], rot: [0, 0, 0.42], mat: 'solar' },
  { shape: 'box', size: [0.66, 0.06, 0.05], pos: [x, 0.63, 0.81], rot: [0, 0, 0.42], mat: 'white' },
  {
    shape: 'box',
    size: [0.66, 0.06, 0.05],
    pos: [x, 0.63, -0.81],
    rot: [0, 0, 0.42],
    mat: 'white',
  },
  { shape: 'cyl', size: [0.04, 0.5], pos: [x, 0.35, 0.5], mat: 'steel' },
  { shape: 'cyl', size: [0.04, 0.5], pos: [x, 0.35, -0.5], mat: 'steel' },
];

const solarField: ModelPart[] = [
  pad(2),
  ...panel(-0.5),
  ...panel(0.2),
  { kit: 'machine_generator', pos: [0.72, Y, 0.55], scale: 0.7, rot: [0, -Math.PI / 2, 0] },
  { shape: 'sphere', size: [0.04], pos: [0.72, 0.45, 0.2], mat: 'glowBlue' },
];

const regolithExcavator: ModelPart[] = [
  pad(2),
  { kit: 'machine_generatorLarge', pos: [-0.3, Y, -0.15], scale: 1.05 },
  { kit: 'rocks_smallA', pos: [0.55, Y, 0.6], scale: 1.4 },
  { kit: 'rover', pos: [0.55, Y, -0.25], scale: 2.2, rot: [0, 0.9, 0] },
  { kit: 'pipe_straight', pos: [-0.3, Y, 0.72], scale: [0.5, 0.5, 0.5], rot: [0, Math.PI / 2, 0] },
  { shape: 'sphere', size: [0.05], pos: [-0.3, 0.95, 0.4], mat: 'glowYellow' },
];

const habitatDome: ModelPart[] = [
  pad(3),
  ...cornerLights(3),
  { kit: 'hangar_roundGlass', pos: [0, Y, 0], scale: 0.85, mats: { dark: 'glass' } },
  { shape: 'box', size: [0.45, 0.5, 0.45], pos: [0.3, 0.35, 0.1], mat: 'white' },
  { shape: 'box', size: [0.4, 0.7, 0.4], pos: [-0.35, 0.45, -0.2], mat: 'white' },
  ...row(3, 0.15, 0.15, {
    shape: 'box',
    size: [0.09, 0.09, 0.02],
    pos: [0, 0.45, 0.33],
    mat: 'window',
  }),
  { shape: 'sphere', size: [0.22], pos: [-0.5, 0.3, 0.45], mat: 'plant' },
  { shape: 'sphere', size: [0.18], pos: [0.55, 0.28, -0.45], mat: 'plant' },
];

const storage: ModelPart[] = [
  pad(2),
  { kit: 'structure_closed', pos: [-0.38, Y, -0.38], scale: 0.72 },
  { kit: 'structure_closed', pos: [0.38, Y, -0.38], scale: 0.72 },
  { kit: 'structure_closed', pos: [-0.38, 0.82, -0.38], scale: 0.72 },
  { kit: 'structure_closed', pos: [-0.38, Y, 0.38], scale: 0.72 },
  { kit: 'barrels', pos: [0.5, Y, 0.5], scale: 0.9 },
];

export const HUMAN_BUILDINGS: Record<BuildingId, readonly ModelPart[]> = {
  commandDome,
  solarField,
  regolithExcavator,
  habitatDome,
  storage,
  ...ADVANCED_SPECS,
};
