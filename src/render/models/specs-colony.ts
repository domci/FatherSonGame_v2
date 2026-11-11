import type { BuildingId } from '../../content/buildings';
import type { ModelPart, Part } from './parts';
import { cornerLights, pad } from './specs-helpers';

export type ColonyId = Extract<BuildingId, 'medbay' | 'park'>;

const Y = 0.1;

/** A small round tree: trunk and leaf ball. */
function tree(x: number, z: number, h: number): Part[] {
  return [
    { shape: 'cyl', size: [0.04, h], pos: [x, Y + h / 2, z], mat: 'dark' },
    { shape: 'sphere', size: [h * 0.55], pos: [x, Y + h + 0.05, z], mat: 'plant' },
  ];
}

/** Human medical station and park: white, glass and green. */
export const COLONY_SPECS: Record<ColonyId, readonly ModelPart[]> = {
  medbay: [
    pad(2),
    { shape: 'box', size: [1.0, 0.5, 0.7], pos: [0, 0.35, -0.1], mat: 'white' },
    { shape: 'box', size: [0.9, 0.08, 0.02], pos: [0, 0.48, 0.26], mat: 'window' },
    { shape: 'box', size: [0.34, 0.1, 0.03], pos: [0, 0.7, 0.26], mat: 'red' },
    { shape: 'box', size: [0.1, 0.34, 0.03], pos: [0, 0.7, 0.26], mat: 'red' },
    { kit: 'machine_barrel', pos: [0.62, Y, 0.55], scale: 0.7 },
    { shape: 'sphere', size: [0.05], pos: [-0.6, 0.3, 0.6], mat: 'glowBlue' },
  ],
  park: [
    pad(3),
    ...cornerLights(3),
    { shape: 'cyl', size: [1.25, 0.04], pos: [0, 0.12, 0], mat: 'green' },
    { shape: 'cyl', size: [0.38, 0.03], pos: [0.35, 0.15, 0.3], mat: 'glowBlue' },
    {
      shape: 'box',
      size: [1.9, 0.02, 0.14],
      pos: [0, 0.15, -0.25],
      rot: [0, 0.4, 0],
      mat: 'white',
    },
    ...tree(-0.55, -0.55, 0.45),
    ...tree(-0.75, 0.25, 0.35),
    ...tree(0.5, -0.6, 0.4),
    ...tree(-0.2, 0.7, 0.3),
    { shape: 'box', size: [0.3, 0.06, 0.1], pos: [0.1, 0.2, 0.15], mat: 'orange' },
  ],
};
