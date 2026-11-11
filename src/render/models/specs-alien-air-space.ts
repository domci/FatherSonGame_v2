import { horns, mound, pod, ribs, veins } from './alien-helpers';
import type { ModelPart } from './parts';
import type { AirSpaceId } from './specs-air-space';

/** Alien nest rocks, thorn sling and sky spike. */
export const ALIEN_AIR_SPACE: Record<AirSpaceId, readonly ModelPart[]> = {
  airfield: [
    ...mound(4),
    ...veins(8, 1.7),
    {
      kit: 'rocks_smallB',
      pos: [-1.1, 0.02, -1.0],
      scale: 2.4,
      mats: { rock: 'chitin', rockTrack: 'chitin' },
    },
    {
      kit: 'rocks_smallA',
      pos: [1.1, 0.02, -1.1],
      scale: 2.0,
      mats: { rock: 'chitin', rockDark: 'chitin' },
    },
    {
      shape: 'torus',
      size: [0.55, 0.12],
      pos: [-0.6, 0.12, 0.7],
      rot: [Math.PI / 2, 0, 0],
      mat: 'chitinLight',
    },
    {
      shape: 'torus',
      size: [0.5, 0.11],
      pos: [0.75, 0.12, 0.6],
      rot: [Math.PI / 2, 0, 0],
      mat: 'chitinLight',
    },
    pod(-0.6, 0.7, 0.18, 0.3, 'glowViolet'),
    pod(0.75, 0.6, 0.16, 0.28, 'glowViolet'),
    ...horns(5, 1.6, 0.9, 'bone'),
  ],
  flakTower: [
    ...mound(2),
    pod(0, 0, 0.45, 0.8, 'chitin'),
    ...ribs(0, 0, 0.45, [0.3, 0.55]),
    {
      shape: 'tendril',
      size: [0.07, 0.9, 0.25],
      pos: [0.12, 0.7, 0],
      rot: [0, 0, 0],
      mat: 'bone',
      name: 'head',
    },
    {
      shape: 'tendril',
      size: [0.07, 0.9, 0.25],
      pos: [-0.12, 0.7, 0],
      rot: [0, Math.PI, 0],
      mat: 'bone',
    },
    { shape: 'sphere', size: [0.12], pos: [0, 0.95, 0.3], mat: 'glowGreen' },
  ],
  orbitalCannon: [
    ...mound(3),
    ...veins(6, 1.3),
    pod(0, 0, 0.75, 1.0, 'chitin'),
    ...ribs(0, 0, 0.75, [0.35, 0.7, 1.0]),
    { shape: 'tendril', size: [0.2, 2.6, 0.25], pos: [0, 0.9, 0], mat: 'chitinLight' },
    { shape: 'sphere', size: [0.16], pos: [0.25, 3.5, 0], mat: 'glowGreen', name: 'core' },
    ...horns(4, 0.9, 0.7, 'bone', 0.3),
  ],
};
