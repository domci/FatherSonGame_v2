import type { BuildingId } from '../../content/buildings';
import type { Part } from './parts';
import { ringOfLights, row } from './specs-helpers';

type Advanced = Exclude<
  BuildingId,
  'commandDome' | 'solarField' | 'regolithExcavator' | 'habitatDome' | 'storage'
>;

export const ADVANCED_SPECS: Record<Advanced, readonly Part[]> = {
  pinkPump: [
    { shape: 'cyl', size: [0.75, 0.2], pos: [0, 0.1, 0], mat: 'dark' },
    { shape: 'cyl', size: [0.22, 1.2], pos: [0, 0.8, 0], mat: 'glass' },
    { shape: 'cyl', size: [0.14, 1.1], pos: [0, 0.8, 0], mat: 'glowPink' },
    { shape: 'cyl', size: [0.3, 0.15], pos: [0, 1.45, 0], mat: 'steel' },
    { shape: 'cyl', size: [0.3, 0.6], pos: [0.6, 0.4, 0.4], mat: 'white' },
    { shape: 'cyl', size: [0.3, 0.6], pos: [-0.6, 0.4, 0.4], mat: 'white' },
    { shape: 'box', size: [1.2, 0.06, 0.06], pos: [0, 0.65, 0.4], mat: 'steel' },
    ...ringOfLights(6, 0.78, 0.22, 'glowPink', 0.04),
  ],
  waterOxygenPlant: [
    { shape: 'box', size: [1.8, 0.15, 1.6], pos: [0, 0.07, 0], mat: 'dark' },
    { shape: 'sphere', size: [0.42], pos: [-0.45, 0.6, -0.3], mat: 'white' },
    { shape: 'sphere', size: [0.42], pos: [0.45, 0.6, -0.3], mat: 'glass' },
    { shape: 'sphere', size: [0.3], pos: [0.45, 0.6, -0.3], mat: 'glowBlue' },
    { shape: 'box', size: [1.4, 0.5, 0.5], pos: [0, 0.4, 0.45], mat: 'white' },
    ...row(4, -0.5, 0.33, {
      shape: 'box',
      size: [0.15, 0.12, 0.02],
      pos: [0, 0.45, 0.71],
      mat: 'glowBlue',
    }),
    { shape: 'cyl', size: [0.05, 1.6], pos: [0.8, 0.8, 0.6], mat: 'steel' },
    { shape: 'box', size: [0.9, 0.06, 0.06], pos: [0, 0.95, -0.3], mat: 'steel' },
  ],
  greenhouse: [
    { shape: 'box', size: [2.7, 0.15, 1.9], pos: [0, 0.07, 0], mat: 'steel' },
    ...row(3, -0.6, 0.6, { shape: 'box', size: [0.4, 0.12, 1.5], pos: [0, 0.2, 0], mat: 'dark' }),
    ...row(3, -0.6, 0.6, {
      shape: 'box',
      size: [0.35, 0.2, 1.45],
      pos: [0, 0.33, 0],
      mat: 'plant',
    }),
    {
      shape: 'halfcyl',
      size: [0.95, 2.6],
      pos: [0, 0.15, 0],
      rot: [0, 0, Math.PI / 2],
      mat: 'glass',
    },
    ...row(4, -0.9, 0.6, {
      shape: 'box',
      size: [0.05, 0.03, 1.4],
      pos: [0, 0.95, 0],
      mat: 'glowPink',
    }),
  ],
  huntingLodge: [
    { shape: 'box', size: [1.7, 0.65, 1.7], pos: [0, 0.33, 0], mat: 'dark' },
    { shape: 'box', size: [1.75, 0.12, 1.75], pos: [0, 0.6, 0], mat: 'orange' },
    { shape: 'cyl', size: [0.35, 0.5], pos: [0.5, 0.9, 0.5], mat: 'steel' },
    { shape: 'cone', size: [0.25, 0.3], pos: [0.5, 1.15, 0.65], rot: [1.3, 0, 0], mat: 'window' },
    ...row(3, -0.6, 0.6, {
      shape: 'cone',
      size: [0.08, 0.5],
      pos: [0, 0.3, 0.95],
      rot: [0.9, 0, 0],
      mat: 'steel',
    }),
    { shape: 'box', size: [0.5, 0.4, 0.02], pos: [-0.4, 0.3, 0.86], mat: 'window' },
  ],
  lab: [
    { shape: 'cyl', size: [0.9, 0.8], pos: [0, 0.4, 0], mat: 'white' },
    ...ringOfLights(10, 0.91, 0.55, 'glowBlue', 0.04),
    { shape: 'dome', size: [0.85], pos: [0, 0.8, 0], mat: 'glass' },
    { shape: 'sphere', size: [0.28], pos: [0, 1.1, 0], mat: 'glowBlue' },
    { shape: 'torus', size: [0.42, 0.03], pos: [0, 1.1, 0], rot: [1.2, 0.3, 0], mat: 'steel' },
    { shape: 'cyl', size: [0.04, 0.8], pos: [0.65, 1.1, -0.5], mat: 'steel' },
    {
      shape: 'cone',
      size: [0.35, 0.15],
      pos: [0.65, 1.55, -0.5],
      rot: [2.6, 0, 0.4],
      mat: 'white',
    },
  ],
  diamondDrill: [
    { shape: 'box', size: [1.6, 0.35, 1.6], pos: [0, 0.18, 0], mat: 'dark' },
    ...[-0.6, 0.6].flatMap((x): Part[] => [
      {
        shape: 'box',
        size: [0.12, 2.4, 0.12],
        pos: [x, 1.2, -0.6],
        rot: [0.08, 0, -x * 0.12],
        mat: 'orange',
      },
      {
        shape: 'box',
        size: [0.12, 2.4, 0.12],
        pos: [x, 1.2, 0.6],
        rot: [-0.08, 0, -x * 0.12],
        mat: 'orange',
      },
    ]),
    { shape: 'box', size: [0.6, 0.15, 0.6], pos: [0, 2.35, 0], mat: 'steel' },
    { shape: 'cyl', size: [0.08, 2.0], pos: [0, 1.35, 0], mat: 'steel' },
    { shape: 'cone', size: [0.25, 0.6], pos: [0, 0.5, 0], rot: [Math.PI, 0, 0], mat: 'steel' },
    { shape: 'sphere', size: [0.18], pos: [0, 0.4, 0], mat: 'glowBlue' },
    { shape: 'sphere', size: [0.06], pos: [0, 2.48, 0], mat: 'red' },
  ],
  spaceport: [
    { shape: 'cyl', size: [1.95, 0.2], pos: [0, 0.1, 0], mat: 'dark' },
    { shape: 'cyl', size: [1.5, 0.21], pos: [0, 0.11, 0], mat: 'steel' },
    {
      shape: 'torus',
      size: [1.25, 0.04],
      pos: [0, 0.23, 0],
      rot: [Math.PI / 2, 0, 0],
      mat: 'glowYellow',
    },
    ...ringOfLights(12, 1.8, 0.25, 'glowBlue', 0.05),
    { shape: 'box', size: [0.35, 2.6, 0.35], pos: [-1.55, 1.3, -1.55], mat: 'steel' },
    { shape: 'box', size: [1.6, 0.14, 0.18], pos: [-0.8, 2.5, -1.55], mat: 'orange' },
    { shape: 'box', size: [0.5, 0.4, 0.5], pos: [1.5, 0.3, -1.4], mat: 'white' },
    { shape: 'box', size: [0.4, 0.12, 0.02], pos: [1.5, 0.35, -1.14], mat: 'window' },
    { shape: 'sphere', size: [0.08], pos: [-1.55, 2.65, -1.55], mat: 'red' },
  ],
};
