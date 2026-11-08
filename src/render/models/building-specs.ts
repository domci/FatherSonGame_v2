import type { BuildingId } from '../../content/buildings';
import type { Part } from './parts';
import { ADVANCED_SPECS } from './specs-advanced';
import { ringOfLights, row } from './specs-helpers';

const commandDome: Part[] = [
  { shape: 'cyl', size: [1.95, 0.25], pos: [0, 0.12, 0], mat: 'dark' },
  { shape: 'torus', size: [1.9, 0.06], pos: [0, 0.26, 0], rot: [Math.PI / 2, 0, 0], mat: 'steel' },
  ...ringOfLights(10, 1.95, 0.3),
  { shape: 'box', size: [0.7, 0.6, 0.7], pos: [-0.7, 0.55, -0.4], mat: 'white' },
  { shape: 'box', size: [0.5, 0.9, 0.5], pos: [-0.2, 0.7, -0.9], mat: 'white' },
  { shape: 'box', size: [0.3, 0.1, 0.02], pos: [-0.7, 0.65, -0.04], mat: 'window' },
  { shape: 'sphere', size: [0.3], pos: [-0.9, 0.45, 0.7], mat: 'plant' },
  {
    shape: 'box',
    size: [2.6, 0.62, 1.0],
    pos: [0.9, 0.55, 0.45],
    rot: [0.12, 0.45, 0.32],
    mat: 'metal',
  },
  {
    shape: 'box',
    size: [1.2, 0.08, 1.9],
    pos: [0.7, 0.55, 0.5],
    rot: [0.12, 0.45, 0.32],
    mat: 'steel',
  },
  { shape: 'cone', size: [0.48, 1.0], pos: [2.1, 0.95, 1.05], rot: [0.3, 0, -1.25], mat: 'white' },
  { shape: 'cyl', size: [0.28, 0.4], pos: [-0.25, 0.25, 0.0], rot: [0, 0, 1.3], mat: 'dark' },
  { shape: 'sphere', size: [0.2], pos: [-0.45, 0.2, 0.0], mat: 'glowBlue' },
  { shape: 'dome', size: [1.85], pos: [0, 0.25, 0], mat: 'glass' },
  { shape: 'cyl', size: [0.05, 2.2], pos: [-1.3, 1.3, -1.2], mat: 'steel' },
  { shape: 'cone', size: [0.35, 0.18], pos: [-1.3, 2.3, -1.2], rot: [Math.PI, 0, 0], mat: 'white' },
  { shape: 'sphere', size: [0.09], pos: [-1.3, 2.45, -1.2], mat: 'glowBlue' },
];

const solarField: Part[] = [
  ...[-0.45, 0.45].flatMap((x): Part[] => [
    { shape: 'box', size: [0.85, 0.04, 1.75], pos: [x, 0.55, 0], rot: [0, 0, 0.4], mat: 'solar' },
    { shape: 'box', size: [0.9, 0.06, 0.05], pos: [x, 0.56, 0.88], rot: [0, 0, 0.4], mat: 'steel' },
    {
      shape: 'box',
      size: [0.9, 0.06, 0.05],
      pos: [x, 0.56, -0.88],
      rot: [0, 0, 0.4],
      mat: 'steel',
    },
    { shape: 'cyl', size: [0.05, 0.55], pos: [x, 0.27, 0], mat: 'steel' },
  ]),
  { shape: 'box', size: [0.25, 0.2, 0.25], pos: [0, 0.1, 0.8], mat: 'dark' },
  { shape: 'sphere', size: [0.04], pos: [0, 0.22, 0.8], mat: 'glowBlue' },
];

const regolithExcavator: Part[] = [
  { shape: 'box', size: [1.3, 0.25, 1.6], pos: [0, 0.13, 0], mat: 'dark' },
  { shape: 'box', size: [1.1, 0.5, 1.0], pos: [0, 0.5, -0.2], mat: 'orange' },
  { shape: 'box', size: [0.5, 0.35, 0.4], pos: [-0.3, 0.92, -0.4], mat: 'orange' },
  { shape: 'box', size: [0.45, 0.2, 0.02], pos: [-0.3, 0.95, -0.19], mat: 'window' },
  {
    shape: 'torus',
    size: [0.45, 0.08],
    pos: [0.2, 0.55, 0.75],
    rot: [0, Math.PI / 2, 0],
    mat: 'steel',
  },
  ...row(4, -0.0, 0.0, {
    shape: 'box',
    size: [0.1, 0.9, 0.14],
    pos: [0.2, 0.55, 0.75],
    mat: 'dark',
  }).map((p, i): Part => ({ ...p, rot: [i * 0.8, 0, 0] })),
  { shape: 'box', size: [0.2, 0.08, 1.2], pos: [0.45, 0.6, 0.1], rot: [0.3, 0, 0], mat: 'steel' },
  { shape: 'cone', size: [0.35, 0.4], pos: [0.45, 0.3, -0.75], mat: 'metal' },
  { shape: 'sphere', size: [0.06], pos: [0.5, 0.8, -0.7], mat: 'glowYellow' },
];

const habitatDome: Part[] = [
  { shape: 'cyl', size: [1.42, 0.22], pos: [0, 0.11, 0], mat: 'steel' },
  ...ringOfLights(8, 1.45, 0.24),
  { shape: 'box', size: [0.55, 0.55, 0.5], pos: [0.35, 0.5, 0.15], mat: 'white' },
  { shape: 'box', size: [0.45, 0.8, 0.45], pos: [-0.35, 0.6, -0.3], mat: 'white' },
  ...row(3, 0.18, 0.17, {
    shape: 'box',
    size: [0.1, 0.1, 0.02],
    pos: [0, 0.6, 0.41],
    mat: 'window',
  }),
  ...row(2, -0.45, 0.2, {
    shape: 'box',
    size: [0.1, 0.1, 0.02],
    pos: [0, 0.8, -0.07],
    mat: 'window',
  }),
  { shape: 'sphere', size: [0.28], pos: [-0.5, 0.35, 0.55], mat: 'plant' },
  { shape: 'sphere', size: [0.2], pos: [0.6, 0.3, -0.6], mat: 'plant' },
  { shape: 'dome', size: [1.38], pos: [0, 0.22, 0], mat: 'glass' },
  { shape: 'box', size: [0.5, 0.45, 0.6], pos: [0, 0.3, 1.45], mat: 'steel' },
  { shape: 'box', size: [0.3, 0.3, 0.02], pos: [0, 0.3, 1.76], mat: 'window' },
];

const storage: Part[] = [
  { shape: 'box', size: [1.8, 0.1, 1.8], pos: [0, 0.05, 0], mat: 'dark' },
  { shape: 'box', size: [0.8, 0.45, 0.5], pos: [-0.4, 0.33, -0.4], mat: 'orange' },
  { shape: 'box', size: [0.8, 0.45, 0.5], pos: [-0.4, 0.33, 0.15], mat: 'white' },
  { shape: 'box', size: [0.8, 0.45, 0.5], pos: [-0.4, 0.78, -0.4], mat: 'red' },
  { shape: 'box', size: [0.8, 0.45, 0.5], pos: [0.45, 0.33, -0.4], mat: 'steel' },
  { shape: 'cyl', size: [0.3, 0.8], pos: [0.5, 0.45, 0.45], mat: 'metal' },
  { shape: 'box', size: [0.08, 1.6, 0.08], pos: [0.8, 0.8, 0.8], mat: 'steel' },
  { shape: 'box', size: [1.2, 0.08, 0.08], pos: [0.3, 1.6, 0.8], mat: 'steel' },
  { shape: 'sphere', size: [0.05], pos: [0.8, 1.68, 0.8], mat: 'glowYellow' },
];

export const HUMAN_BUILDINGS: Record<BuildingId, readonly Part[]> = {
  commandDome,
  solarField,
  regolithExcavator,
  habitatDome,
  storage,
  ...ADVANCED_SPECS,
};
