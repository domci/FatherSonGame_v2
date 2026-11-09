import { horns, mound, pod, veins } from './alien-helpers';
import type { ModelPart } from './parts';

/** Alien spaceport: a tall living tower with a glowing bulb on top. */
export const ALIEN_SPACEPORT: readonly ModelPart[] = [
  ...mound(4),
  ...veins(6, 1.7),
  { shape: 'tendril', size: [0.22, 2.4, 0.3], pos: [-0.5, 0.05, -0.5], mat: 'chitin' },
  {
    shape: 'sphere',
    size: [0.55],
    scale: [1, 1.3, 1],
    pos: [-0.2, 2.6, -0.5],
    mat: 'chitinLight',
  },
  { shape: 'sphere', size: [0.3], pos: [-0.2, 2.6, -0.05], mat: 'glowGreen', name: 'core' },
  ...horns(5, 1.5, 0.7, 'chitinLight'),
  pod(0.9, 0.9, 0.35, 0.55, 'chitin'),
  pod(1.2, 0.3, 0.28, 0.45, 'chitin'),
  {
    shape: 'torus',
    size: [0.85, 0.06],
    pos: [0.7, 0.06, 0.7],
    rot: [Math.PI / 2, 0, 0],
    mat: 'glowGreen',
  },
];
