import type { Group } from 'three/webgpu';
import type { UnitId } from '../../content/units';
import { buildModel, type Part } from './parts';

const SPIDER: Part[] = [
  { shape: 'sphere', size: [0.32], pos: [0, 0.35, 0], mat: 'dark' },
  { shape: 'sphere', size: [0.2], pos: [0, 0.4, 0.35], mat: 'dark' },
  ...[-0.08, 0, 0.08].flatMap((x): Part[] => [
    { shape: 'sphere', size: [0.035], pos: [x, 0.47, 0.52], mat: 'glowPink' },
    { shape: 'sphere', size: [0.03], pos: [x * 1.4, 0.4, 0.53], mat: 'glowPink' },
  ]),
  ...[-1, 1].flatMap((side): Part[] =>
    [-0.25, 0, 0.25].map((z) => ({
      shape: 'box',
      size: [0.7, 0.04, 0.04],
      pos: [side * 0.38, 0.28, z],
      rot: [0, z * side, side * -0.6],
      mat: 'dark',
    })),
  ),
];

const SPECS: Record<UnitId, Part[]> = {
  drone: [
    { shape: 'sphere', size: [0.18], pos: [0, 0, 0], mat: 'white' },
    { shape: 'torus', size: [0.3, 0.03], rot: [Math.PI / 2, 0, 0], mat: 'metal' },
    { shape: 'sphere', size: [0.05], pos: [0, 0, 0.17], mat: 'glowBlue' },
  ],
  hunter: [
    { shape: 'cyl', size: [0.16, 0.5], pos: [0, 0.35, 0], mat: 'white' },
    { shape: 'sphere', size: [0.16], pos: [0, 0.72, 0], mat: 'glass' },
    { shape: 'box', size: [0.06, 0.06, 0.4], pos: [0.18, 0.45, 0.15], mat: 'dark' },
    { shape: 'sphere', size: [0.03], pos: [0.18, 0.45, 0.36], mat: 'glowYellow' },
  ],
  miningShip: [
    { shape: 'cone', size: [0.35, 1.1], rot: [Math.PI / 2, 0, 0], mat: 'metal' },
    { shape: 'box', size: [1, 0.06, 0.4], pos: [0, 0, -0.2], mat: 'orange' },
    { shape: 'sphere', size: [0.12], pos: [0, 0, -0.55], mat: 'glowBlue' },
  ],
  spider: SPIDER,
};

export function unitModel(type: UnitId): Group {
  return buildModel(SPECS[type]);
}

export function eggModel(): Group {
  const g = buildModel([{ shape: 'sphere', size: [0.18], pos: [0, 0.18, 0], mat: 'glowPink' }]);
  g.scale.set(1, 1.3, 1);
  return g;
}

export function nestModel(): Group {
  return buildModel([
    { shape: 'dome', size: [1.2], mat: 'dark' },
    { shape: 'sphere', size: [0.25], pos: [0, 0.3, 0.95], mat: 'glowPink' },
  ]);
}
