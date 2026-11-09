import type { BuildingId } from '../../content/buildings';
import type { ModelPart } from './parts';
import { cornerLights, pad, ringOfLights } from './specs-helpers';

export type MilitaryId = Extract<
  BuildingId,
  'barracks' | 'vehicleFactory' | 'wall' | 'turret' | 'shieldReactor' | 'forceField'
>;

const Y = 0.1;

/** Human army and defense buildings: concrete, steel, orange stripes, yellow lights. */
export const MILITARY_SPECS: Record<MilitaryId, readonly ModelPart[]> = {
  barracks: [
    pad(3),
    ...cornerLights(3),
    { kit: 'hangar_smallA', pos: [-0.35, Y, -0.35], scale: 1.25 },
    { kit: 'structure_detailed', pos: [0.95, Y, -0.85], scale: 0.75 },
    { kit: 'corridor_window', pos: [0.75, Y, 0.65], scale: 0.75, rot: [0, Math.PI / 2, 0] },
    { kit: 'barrels', pos: [-1.15, Y, 1.1], scale: 0.8 },
    { shape: 'cyl', size: [0.03, 1.5], pos: [1.2, 0.85, 1.15], mat: 'steel' },
    { shape: 'box', size: [0.42, 0.26, 0.02], pos: [1.0, 1.42, 1.15], mat: 'orange' },
    { shape: 'sphere', size: [0.05], pos: [1.2, 1.62, 1.15], mat: 'glowYellow' },
  ],
  vehicleFactory: [
    pad(4),
    ...cornerLights(4),
    { kit: 'hangar_largeA', pos: [-0.35, Y, -0.45], scale: 1.05 },
    { kit: 'rover', pos: [1.15, Y, 1.05], scale: 2.6, rot: [0, -0.7, 0] },
    { kit: 'supports_low', pos: [-1.35, Y, 1.35], scale: 0.9 },
    { shape: 'box', size: [0.08, 1.8, 0.08], pos: [1.6, 1.0, -1.5], mat: 'orange' },
    { shape: 'box', size: [1.6, 0.08, 0.08], pos: [0.85, 1.9, -1.5], mat: 'orange' },
    { shape: 'cyl', size: [0.015, 0.7], pos: [0.3, 1.5, -1.5], mat: 'steel' },
    { shape: 'box', size: [0.3, 0.2, 0.3], pos: [0.3, 1.1, -1.5], mat: 'dark' },
    { shape: 'box', size: [0.9, 0.04, 0.12], pos: [-0.35, 0.12, 1.75], mat: 'glowYellow' },
  ],
  wall: [
    { shape: 'box', size: [0.98, 0.72, 0.98], pos: [0, 0.36, 0], mat: 'white' },
    { shape: 'box', size: [1.0, 0.09, 1.0], pos: [0, 0.48, 0], mat: 'orange' },
    { shape: 'box', size: [0.92, 0.12, 0.92], pos: [0, 0.78, 0], mat: 'steel' },
    { shape: 'box', size: [0.2, 0.04, 0.2], pos: [0, 0.86, 0], mat: 'window' },
  ],
  turret: [
    pad(2),
    { shape: 'cyl', size: [0.62, 0.3], pos: [0, 0.25, 0], mat: 'steel' },
    {
      shape: 'torus',
      size: [0.62, 0.04],
      pos: [0, 0.4, 0],
      rot: [Math.PI / 2, 0, 0],
      mat: 'orange',
    },
    { kit: 'turret_single', pos: [0, 0.38, 0], scale: 1.35, name: 'head' },
    ...ringOfLights(6, 0.82, 0.14, 'window', 0.04),
  ],
  shieldReactor: [
    pad(2),
    { kit: 'machine_generatorLarge', pos: [0, Y, 0], scale: [0.9, 0.8, 0.9] },
    { shape: 'cyl', size: [0.08, 1.6], pos: [0, 1.2, 0], mat: 'steel' },
    { shape: 'sphere', size: [0.22], pos: [0, 2.05, 0], mat: 'glowBlue', name: 'core' },
    {
      shape: 'torus',
      size: [0.42, 0.035],
      pos: [0, 1.5, 0],
      rot: [Math.PI / 2, 0, 0],
      mat: 'glowBlue',
      name: 'ring',
    },
    {
      shape: 'torus',
      size: [0.32, 0.03],
      pos: [0, 1.75, 0],
      rot: [Math.PI / 2, 0, 0],
      mat: 'glowBlue',
    },
    ...ringOfLights(8, 0.85, 0.14, 'glowBlue', 0.04),
  ],
  forceField: [
    { shape: 'cyl', size: [0.09, 1.1], pos: [-0.42, 0.55, 0], mat: 'steel' },
    { shape: 'cyl', size: [0.09, 1.1], pos: [0.42, 0.55, 0], mat: 'steel' },
    { shape: 'sphere', size: [0.07], pos: [-0.42, 1.12, 0], mat: 'glowBlue' },
    { shape: 'sphere', size: [0.07], pos: [0.42, 1.12, 0], mat: 'glowBlue' },
    { shape: 'box', size: [0.84, 0.95, 0.06], pos: [0, 0.58, 0], mat: 'shieldBlue', name: 'field' },
    { shape: 'box', size: [0.06, 0.95, 0.84], pos: [0, 0.58, 0], mat: 'shieldBlue' },
  ],
};
