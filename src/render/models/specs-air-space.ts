import type { BuildingId } from '../../content/buildings';
import type { ModelPart, Part } from './parts';
import { cornerLights, pad, ringOfLights, row } from './specs-helpers';

export type AirSpaceId = Extract<BuildingId, 'airfield' | 'flakTower' | 'orbitalCannon'>;

const Y = 0.1;

/** A dark runway with a dashed middle line and lights on both sides. */
function runway(): Part[] {
  return [
    { shape: 'box', size: [3.7, 0.04, 1.1], pos: [0, 0.12, 1.2], mat: 'dark' },
    ...row(6, -1.5, 0.6, {
      shape: 'box',
      size: [0.3, 0.02, 0.06],
      pos: [0, 0.15, 1.2],
      mat: 'white',
    }),
    ...row(7, -1.75, 0.58, {
      shape: 'sphere',
      size: [0.035],
      pos: [0, 0.15, 0.68],
      mat: 'glowYellow',
    }),
    ...row(7, -1.75, 0.58, {
      shape: 'sphere',
      size: [0.035],
      pos: [0, 0.15, 1.72],
      mat: 'glowYellow',
    }),
  ];
}

/** Human air field, flak tower and orbital cannon: steel, orange stripes, blue glow. */
export const AIR_SPACE_SPECS: Record<AirSpaceId, readonly ModelPart[]> = {
  airfield: [
    pad(4),
    ...cornerLights(4),
    ...runway(),
    { kit: 'hangar_largeB', pos: [-0.75, Y, -0.75], scale: 0.95 },
    { kit: 'craft_speederD', pos: [0.6, 0.15, 1.2], scale: 0.7, rot: [0, -Math.PI / 2, 0] },
    { shape: 'cyl', size: [0.16, 1.3], pos: [1.45, 0.75, -1.25], mat: 'white' },
    { shape: 'cyl', size: [0.3, 0.32], pos: [1.45, 1.5, -1.25], mat: 'glass' },
    { shape: 'cyl', size: [0.33, 0.06], pos: [1.45, 1.69, -1.25], mat: 'orange' },
    { shape: 'sphere', size: [0.06], pos: [1.45, 1.8, -1.25], mat: 'glowBlue' },
  ],
  flakTower: [
    pad(2),
    { shape: 'cyl', size: [0.55, 0.55], pos: [0, 0.38, 0], mat: 'white' },
    { shape: 'cyl', size: [0.58, 0.08], pos: [0, 0.5, 0], mat: 'orange' },
    { kit: 'turret_double', pos: [0, 0.65, 0], scale: 1.25, name: 'head' },
    ...ringOfLights(6, 0.6, 0.66, 'window', 0.04),
  ],
  orbitalCannon: [
    pad(3),
    ...cornerLights(3),
    { shape: 'cyl', size: [1.05, 0.45], pos: [0, 0.32, 0], mat: 'steel' },
    {
      shape: 'torus',
      size: [1.05, 0.05],
      pos: [0, 0.55, 0],
      rot: [Math.PI / 2, 0, 0],
      mat: 'orange',
    },
    { shape: 'cyl', size: [0.55, 0.6], pos: [0, 0.85, 0], mat: 'white' },
    { shape: 'cyl', size: [0.16, 2.2], pos: [0.2, 2.0, 0], rot: [0, 0, -0.18], mat: 'steel' },
    { shape: 'cyl', size: [0.22, 0.3], pos: [0.06, 1.3, 0], rot: [0, 0, -0.18], mat: 'dark' },
    {
      shape: 'torus',
      size: [0.24, 0.035],
      pos: [0.31, 2.55, 0],
      rot: [Math.PI / 2, 0.18, 0],
      mat: 'glowBlue',
      name: 'ring',
    },
    { shape: 'sphere', size: [0.1], pos: [0.4, 3.08, 0], mat: 'glowBlue', name: 'core' },
    { kit: 'satelliteDish_detailed', pos: [-0.95, Y, 0.95], scale: 0.7, rot: [0, 2.2, 0] },
    { kit: 'machine_generator', pos: [0.95, Y, 0.95], scale: 0.6 },
  ],
};
