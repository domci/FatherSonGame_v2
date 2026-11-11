import type { BuildingId } from '../../content/buildings';
import type { ModelPart } from './parts';
import { cornerLights, pad, ringOfLights, row } from './specs-helpers';
import type { MilitaryId } from './specs-military';
import type { AirSpaceId } from './specs-air-space';
import type { ColonyId } from './specs-colony';

type Advanced = Exclude<
  BuildingId,
  | 'commandDome'
  | 'solarField'
  | 'regolithExcavator'
  | 'habitatDome'
  | 'storage'
  | MilitaryId
  | AirSpaceId
  | ColonyId
>;

const Y = 0.1;

const greenhouseTunnel = (z: number): ModelPart[] => [
  ...row(3, -0.7, 0.7, { shape: 'box', size: [0.4, 0.12, 0.7], pos: [0, 0.18, z], mat: 'dark' }),
  ...row(3, -0.7, 0.7, { shape: 'box', size: [0.34, 0.2, 0.62], pos: [0, 0.32, z], mat: 'plant' }),
  {
    shape: 'halfcyl',
    size: [0.55, 2.5],
    pos: [0, 0.12, z],
    rot: [0, 0, Math.PI / 2],
    mat: 'glass',
  },
  ...row(4, -0.9, 0.6, {
    shape: 'box',
    size: [0.05, 0.03, 0.6],
    pos: [0, 0.6, z],
    mat: 'glowPink',
  }),
];

export const ADVANCED_SPECS: Record<Advanced, readonly ModelPart[]> = {
  pinkPump: [
    pad(2),
    { kit: 'machine_barrelLarge', pos: [-0.15, Y, -0.1], scale: 1.45, mats: { dark: 'glowPink' } },
    { kit: 'pipe_ring', pos: [0.65, Y, 0.65], scale: 0.6 },
    ...ringOfLights(6, 0.85, 0.14, 'glowPink', 0.04),
  ],
  waterOxygenPlant: [
    pad(2),
    { kit: 'machine_barrel', pos: [-0.45, Y, -0.45], scale: 1.2 },
    { kit: 'machine_barrel', pos: [0.4, Y, -0.45], scale: 1.2, rot: [0, Math.PI, 0] },
    { kit: 'chimney_detailed', pos: [0.62, Y, 0.55], scale: [0.8, 0.75, 0.8] },
    { kit: 'machine_generator', pos: [-0.35, Y, 0.5], scale: 1 },
    { shape: 'sphere', size: [0.05], pos: [0.62, 1.65, 0.55], mat: 'glowBlue' },
  ],
  greenhouse: [pad(3), ...cornerLights(3), ...greenhouseTunnel(-0.6), ...greenhouseTunnel(0.6)],
  huntingLodge: [
    pad(2),
    { kit: 'hangar_smallB', pos: [-0.15, Y, -0.2], scale: 0.72 },
    { kit: 'turret_single', pos: [0.6, Y, 0.6], scale: 0.85, rot: [0, 0.6, 0] },
    { kit: 'barrels', pos: [-0.6, Y, 0.7], scale: 0.7 },
  ],
  lab: [
    pad(2),
    { kit: 'hangar_roundA', pos: [-0.1, Y, -0.1], scale: 0.52 },
    { kit: 'satelliteDish_detailed', pos: [0.62, Y, 0.62], scale: 0.85, rot: [0, -0.7, 0] },
    { kit: 'machine_wireless', pos: [-0.62, Y, 0.68], scale: 0.65 },
    { shape: 'sphere', size: [0.08], pos: [-0.1, 0.95, -0.1], mat: 'glowBlue' },
  ],
  diamondDrill: [
    pad(2),
    { kit: 'structure_detailed', pos: [0, Y, -0.1], scale: [0.85, 1.4, 0.85] },
    { kit: 'chimney_detailed', pos: [0, Y, -0.1], scale: [0.55, 0.85, 0.55] },
    { kit: 'rock_crystals', pos: [0.62, Y, 0.62], scale: 0.85 },
    { kit: 'machine_generator', pos: [-0.6, Y, 0.62], scale: 0.75 },
  ],
  spaceport: [
    pad(4),
    ...cornerLights(4),
    { kit: 'craft_miner', pos: [0.55, Y, 0.45], scale: 1.1, rot: [0, -0.5, 0] },
    { kit: 'rocket_baseA', pos: [-1.1, Y, -1.1], scale: 0.7 },
    { kit: 'rocket_fuelB', pos: [-1.1, 1.22, -1.1], scale: 0.7 },
    { kit: 'rocket_sidesA', pos: [-1.1, 1.92, -1.1], scale: 0.7 },
    { kit: 'rocket_topA', pos: [-1.1, 2.62, -1.1], scale: 0.7 },
    { kit: 'hangar_largeA', pos: [-1.2, Y, 0.95], scale: 0.62, rot: [0, Math.PI / 2, 0] },
    { kit: 'satelliteDish_large', pos: [1.35, Y, -1.35], scale: 0.9 },
  ],
};
