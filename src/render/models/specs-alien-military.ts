import type { BuildingId } from '../../content/buildings';
import { horns, mound, pod, ribs, veins } from './alien-helpers';
import type { ModelPart } from './parts';

type Id = Extract<
  BuildingId,
  'barracks' | 'vehicleFactory' | 'wall' | 'turret' | 'shieldReactor' | 'forceField'
>;

export const ALIEN_MILITARY: Record<Id, readonly ModelPart[]> = {
  barracks: [
    ...mound(3),
    ...veins(6, 1.1),
    pod(-0.4, -0.3, 0.6, 0.9, 'chitin'),
    pod(0.5, -0.4, 0.38, 0.6, 'chitin'),
    pod(0.45, 0.5, 0.42, 0.7, 'chitin'),
    pod(-0.6, 0.6, 0.3, 0.45, 'chitinLight'),
    ...ribs(-0.4, -0.3, 0.6, [0.35, 0.65]),
    { shape: 'sphere', size: [0.16], pos: [-0.4, 0.75, 0.2], mat: 'glowGreen' },
    { shape: 'sphere', size: [0.11], pos: [0.45, 0.55, 0.88], mat: 'glowGreen' },
    ...horns(4, 1.15, 0.6, 'bone'),
  ],
  vehicleFactory: [
    ...mound(4),
    {
      shape: 'halfcyl',
      size: [1.05, 2.6],
      pos: [-0.2, 0.05, -0.3],
      rot: [0, 0, Math.PI / 2],
      mat: 'chitin',
    },
    ...ribs(-0.2, -0.3, 1.0, [0.2]).map((p) => p),
    {
      shape: 'arc',
      size: [1.06, 0.06, Math.PI],
      pos: [-1.2, 0.05, -0.3],
      rot: [0, Math.PI / 2, 0],
      mat: 'chitinLight',
    },
    {
      shape: 'arc',
      size: [1.06, 0.06, Math.PI],
      pos: [-0.2, 0.05, -0.3],
      rot: [0, Math.PI / 2, 0],
      mat: 'chitinLight',
    },
    {
      shape: 'arc',
      size: [1.06, 0.06, Math.PI],
      pos: [0.8, 0.05, -0.3],
      rot: [0, Math.PI / 2, 0],
      mat: 'chitinLight',
    },
    { shape: 'box', size: [2.2, 0.06, 0.06], pos: [-0.2, 0.7, 0.65], mat: 'glowGreen' },
    pod(1.2, 1.2, 0.4, 0.5, 'fleshDark'),
    ...horns(3, 0.3, 0.5, 'bone').map((p) => ({
      ...p,
      pos: [1.2 + (p.pos?.[0] ?? 0), 0.4, 1.2 + (p.pos?.[2] ?? 0)] as [number, number, number],
    })),
  ],
  wall: [
    { shape: 'sphere', size: [0.5], scale: [1, 0.85, 1], pos: [0, 0.3, 0], mat: 'chitin' },
    ...horns(4, 0.3, 0.55, 'bone', 0.3),
    { shape: 'sphere', size: [0.06], pos: [0, 0.74, 0], mat: 'glowGreen' },
  ],
  turret: [
    ...mound(2),
    { shape: 'tendril', size: [0.16, 0.8, 0.08], pos: [0, 0.05, 0], mat: 'chitin' },
    { shape: 'sphere', size: [0.36], pos: [0.08, 0.95, 0], mat: 'chitinLight', name: 'head' },
    ...horns(5, 0.6, 0.5, 'bone'),
  ],
  shieldReactor: [
    ...mound(2, 'glowCyan'),
    pod(0, 0, 0.5, 0.95, 'flesh'),
    { shape: 'sphere', size: [0.32], pos: [0, 0.75, 0], mat: 'glowCyan', name: 'core' },
    {
      shape: 'torus',
      size: [0.6, 0.04],
      pos: [0, 0.65, 0],
      rot: [Math.PI / 2, 0, 0],
      mat: 'glowCyan',
      name: 'ring',
    },
    ...horns(4, 0.55, 1.1, 'chitinLight'),
  ],
  forceField: [
    { shape: 'tendril', size: [0.07, 1.1, 0.1], pos: [-0.42, 0, 0], mat: 'bone' },
    { shape: 'tendril', size: [0.07, 1.1, -0.1], pos: [0.42, 0, 0], mat: 'bone' },
    { shape: 'box', size: [0.84, 0.95, 0.06], pos: [0, 0.55, 0], mat: 'membrane', name: 'field' },
    { shape: 'box', size: [0.06, 0.95, 0.84], pos: [0, 0.55, 0], mat: 'membrane' },
  ],
};
