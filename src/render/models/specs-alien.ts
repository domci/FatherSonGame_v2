import type { BuildingId } from '../../content/buildings';
import { horns, mound, mushroom, pod, ribs, veins } from './alien-helpers';
import type { ModelPart } from './parts';
import { ALIEN_MILITARY } from './specs-alien-military';
import { ALIEN_SPACEPORT } from './specs-alien-space';
import { ALIEN_AIR_SPACE } from './specs-alien-air-space';
import { ALIEN_COLONY } from './specs-alien-colony';

/** Alien buildings: living mounds, chitin shells, glowing veins. Same footprint as the human ones. */
type Other = keyof typeof ALIEN_MILITARY | keyof typeof ALIEN_AIR_SPACE | keyof typeof ALIEN_COLONY;
const BASE: Record<Exclude<BuildingId, Other | 'spaceport'>, readonly ModelPart[]> = {
  commandDome: [
    ...mound(4),
    ...veins(8, 1.6),
    pod(0, 0, 1.05, 1.5, 'chitin'),
    ...ribs(0, 0, 1.08, [0.45, 0.8, 1.15], 'chitinLight'),
    { shape: 'sphere', size: [0.42], pos: [0, 1.55, 0], mat: 'glowGreen', name: 'core' },
    { shape: 'sphere', size: [0.6], pos: [0, 1.55, 0], mat: 'membrane' },
    ...horns(6, 1.25, 1.3, 'bone'),
    pod(1.35, 1.1, 0.32, 0.5, 'chitinLight'),
    pod(-1.4, 0.9, 0.28, 0.45, 'chitinLight'),
    { shape: 'sphere', size: [0.09], pos: [1.35, 0.55, 1.33], mat: 'glowGreen' },
    { shape: 'sphere', size: [0.09], pos: [-1.4, 0.5, 1.12], mat: 'glowGreen' },
  ],
  solarField: [
    ...mound(2),
    { shape: 'tendril', size: [0.06, 0.8, 0.2], pos: [-0.3, 0.05, 0], mat: 'chitinLight' },
    { shape: 'tendril', size: [0.06, 0.7, -0.2], pos: [0.35, 0.05, 0.1], mat: 'chitinLight' },
    {
      shape: 'sphere',
      size: [0.55],
      scale: [1, 0.08, 0.6],
      pos: [-0.15, 0.85, 0],
      rot: [0, 0, 0.45],
      mat: 'glowCyan',
    },
    {
      shape: 'sphere',
      size: [0.5],
      scale: [1, 0.08, 0.6],
      pos: [0.2, 0.75, 0.1],
      rot: [0, 0.6, -0.4],
      mat: 'glowCyan',
    },
    {
      shape: 'sphere',
      size: [0.58],
      scale: [1, 0.05, 0.64],
      pos: [-0.15, 0.83, 0],
      rot: [0, 0, 0.45],
      mat: 'chitin',
    },
  ],
  regolithExcavator: [
    ...mound(2),
    pod(-0.15, -0.1, 0.55, 0.7, 'chitin'),
    {
      shape: 'torus',
      size: [0.3, 0.09],
      pos: [0.2, 0.55, 0.25],
      rot: [0.9, 0, 0.3],
      mat: 'fleshDark',
    },
    { shape: 'sphere', size: [0.22], pos: [0.2, 0.55, 0.25], mat: 'glowGreen' },
    ...horns(5, 0.32, 0.25, 'bone', 0.5).map((p) => ({
      ...p,
      pos: [0.2 + (p.pos?.[0] ?? 0) * 0.5, 0.5, 0.25 + (p.pos?.[2] ?? 0) * 0.5] as [
        number,
        number,
        number,
      ],
    })),
    {
      kit: 'rocks_smallA',
      pos: [0.6, 0.05, -0.55],
      scale: 1.1,
      mats: { rock: 'chitin', rockDark: 'chitin' },
    },
  ],
  habitatDome: [
    ...mound(3),
    pod(-0.35, -0.2, 0.55, 0.95, 'chitin'),
    pod(0.5, 0.25, 0.42, 0.75, 'chitin'),
    pod(-0.3, 0.7, 0.32, 0.55, 'chitinLight'),
    {
      shape: 'sphere',
      size: [0.18],
      scale: [1, 1.4, 0.5],
      pos: [-0.35, 0.6, 0.33],
      mat: 'membrane',
    },
    {
      shape: 'sphere',
      size: [0.12],
      scale: [1, 1.4, 0.5],
      pos: [0.5, 0.45, 0.62],
      mat: 'glowGreen',
    },
    {
      shape: 'sphere',
      size: [0.1],
      scale: [1, 1.4, 0.5],
      pos: [-0.3, 0.33, 0.98],
      mat: 'glowGreen',
    },
    ...ribs(-0.35, -0.2, 0.56, [0.3, 0.55, 0.8]),
  ],
  storage: [
    ...mound(2),
    { shape: 'sphere', size: [0.45], pos: [-0.25, 0.45, -0.15], mat: 'membrane' },
    { shape: 'sphere', size: [0.3], pos: [-0.25, 0.4, -0.15], mat: 'glowViolet' },
    { shape: 'sphere', size: [0.33], pos: [0.4, 0.33, 0.35], mat: 'membrane' },
    { shape: 'sphere', size: [0.2], pos: [0.4, 0.3, 0.35], mat: 'glowCyan' },
    ...horns(4, 0.75, 0.4, 'chitinLight'),
  ],
  pinkPump: [
    ...mound(2, 'glowPink'),
    {
      shape: 'tendril',
      size: [0.08, 0.6, 0.5],
      pos: [-0.5, 0, -0.3],
      rot: [0, 0.6, Math.PI * 0.7],
      mat: 'fleshDark',
    },
    {
      shape: 'tendril',
      size: [0.08, 0.6, 0.5],
      pos: [0.5, 0, 0.3],
      rot: [0, -2.4, Math.PI * 0.7],
      mat: 'fleshDark',
    },
    pod(0, 0, 0.42, 0.9, 'flesh'),
    { shape: 'sphere', size: [0.26], pos: [0, 0.75, 0], mat: 'glowPink', name: 'core' },
    ...ribs(0, 0, 0.43, [0.35, 0.6]),
  ],
  waterOxygenPlant: [
    ...mound(2, 'glowCyan'),
    pod(-0.2, 0, 0.5, 0.7, 'flesh'),
    { shape: 'cone', size: [0.14, 0.6], pos: [0.35, 0.75, -0.2], mat: 'chitin' },
    { shape: 'cone', size: [0.12, 0.5], pos: [0.45, 0.6, 0.3], mat: 'chitin' },
    { shape: 'sphere', size: [0.07], pos: [0.35, 1.07, -0.2], mat: 'glowCyan' },
    { shape: 'sphere', size: [0.06], pos: [0.45, 0.86, 0.3], mat: 'glowCyan' },
    { shape: 'sphere', size: [0.2], scale: [1, 0.6, 1], pos: [-0.2, 0.75, 0], mat: 'glowCyan' },
  ],
  greenhouse: [
    ...mound(3, 'glowViolet'),
    ...mushroom(-0.5, -0.4, 0.9, 0.5),
    ...mushroom(0.55, -0.2, 0.6, 0.38),
    ...mushroom(0.1, 0.6, 0.75, 0.42),
    ...mushroom(-0.8, 0.6, 0.4, 0.25),
    ...mushroom(0.9, 0.75, 0.35, 0.22),
  ],
  huntingLodge: [
    ...mound(2),
    pod(0, 0, 0.45, 0.5, 'fleshDark'),
    ...horns(7, 0.55, 0.9, 'bone'),
    { shape: 'sphere', size: [0.12], pos: [0, 0.55, 0.3], mat: 'glowGreen' },
    { shape: 'sphere', size: [0.07], pos: [0.18, 0.5, 0.32], mat: 'glowGreen' },
    { shape: 'sphere', size: [0.07], pos: [-0.18, 0.5, 0.32], mat: 'glowGreen' },
  ],
  lab: [
    ...mound(2, 'glowViolet'),
    {
      kit: 'rock_crystalsLargeA',
      pos: [0, 0.02, 0],
      scale: 1.3,
      mats: { crystal: 'glowViolet', rock: 'chitin', rockDark: 'chitin' },
    },
    ...ribs(0, 0, 0.6, [0.1]),
    { shape: 'sphere', size: [0.12], pos: [0.55, 0.12, 0.5], mat: 'glowViolet' },
  ],
  diamondDrill: [
    ...mound(2, 'glowCyan'),
    {
      shape: 'arc',
      size: [0.45, 0.13, Math.PI],
      pos: [0, 0.05, 0],
      rot: [0, 0.4, 0],
      mat: 'chitin',
    },
    {
      shape: 'arc',
      size: [0.3, 0.1, Math.PI],
      pos: [0.1, 0.05, 0.1],
      rot: [0, 1.9, 0],
      mat: 'chitinLight',
    },
    { kit: 'rock_crystals', pos: [0.5, 0.03, -0.5], scale: 0.9, mats: { crystal: 'glowCyan' } },
    { shape: 'sphere', size: [0.1], pos: [-0.42, 0.12, -0.17], mat: 'glowCyan' },
  ],
};

export const ALIEN_BUILDINGS: Record<BuildingId, readonly ModelPart[]> = {
  ...BASE,
  spaceport: ALIEN_SPACEPORT,
  ...ALIEN_MILITARY,
  ...ALIEN_AIR_SPACE,
  ...ALIEN_COLONY,
};
