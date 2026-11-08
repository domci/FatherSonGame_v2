import type { BuildingId } from '../../content/buildings';
import type { Part } from './parts';

/**
 * Human building looks, made from simple shapes.
 * Later (M5) these are replaced by glTF model files with the same ids.
 */
export const HUMAN_BUILDINGS: Record<BuildingId, readonly Part[]> = {
  commandDome: [
    { shape: 'cyl', size: [1.9, 0.3], pos: [0, 0.15, 0], mat: 'dark' },
    { shape: 'dome', size: [1.8], pos: [0, 0.3, 0], mat: 'glass' },
    {
      shape: 'box',
      size: [2.2, 0.7, 0.9],
      pos: [0.2, 0.6, 0.1],
      rot: [0.1, 0.5, 0.25],
      mat: 'metal',
    },
    { shape: 'cone', size: [0.45, 1], pos: [1.2, 0.7, 0.6], rot: [0, 0, -1.3], mat: 'white' },
    { shape: 'cyl', size: [0.08, 1.6], pos: [-1.1, 1.1, -1.1], mat: 'metal' },
    { shape: 'sphere', size: [0.12], pos: [-1.1, 1.95, -1.1], mat: 'glowBlue' },
  ],
  solarField: [
    {
      shape: 'box',
      size: [0.8, 0.05, 1.7],
      pos: [-0.45, 0.45, 0],
      rot: [0, 0, 0.35],
      mat: 'solar',
    },
    { shape: 'box', size: [0.8, 0.05, 1.7], pos: [0.45, 0.45, 0], rot: [0, 0, 0.35], mat: 'solar' },
    { shape: 'cyl', size: [0.06, 0.45], pos: [-0.45, 0.22, 0], mat: 'metal' },
    { shape: 'cyl', size: [0.06, 0.45], pos: [0.45, 0.22, 0], mat: 'metal' },
  ],
  regolithExcavator: [
    { shape: 'box', size: [1.4, 0.5, 1.4], pos: [0, 0.25, 0], mat: 'orange' },
    { shape: 'box', size: [0.25, 0.25, 1.6], pos: [0.3, 0.9, 0.3], rot: [0.6, 0, 0], mat: 'dark' },
    { shape: 'cone', size: [0.35, 0.6], pos: [0.3, 0.35, 1], rot: [Math.PI, 0, 0], mat: 'metal' },
    { shape: 'sphere', size: [0.08], pos: [-0.5, 0.6, -0.5], mat: 'glowYellow' },
  ],
  habitatDome: [
    { shape: 'cyl', size: [1.4, 0.2], pos: [0, 0.1, 0], mat: 'metal' },
    { shape: 'dome', size: [1.35], pos: [0, 0.2, 0], mat: 'glass' },
    { shape: 'box', size: [0.5, 0.6, 0.5], pos: [0.3, 0.5, 0.2], mat: 'white' },
    { shape: 'box', size: [0.4, 0.4, 0.4], pos: [-0.4, 0.4, -0.2], mat: 'white' },
    { shape: 'sphere', size: [0.07], pos: [0.3, 0.9, 0.2], mat: 'glowYellow' },
  ],
  storage: [
    { shape: 'box', size: [1.7, 0.9, 1.7], pos: [0, 0.45, 0], mat: 'dark' },
    { shape: 'cyl', size: [0.85, 1.7], pos: [0, 0.9, 0], rot: [0, 0, Math.PI / 2], mat: 'metal' },
  ],
  pinkPump: [
    { shape: 'cyl', size: [0.6, 0.6], pos: [0, 0.3, 0], mat: 'metal' },
    { shape: 'cyl', size: [0.3, 0.8], pos: [0, 0.8, 0], mat: 'glowPink' },
    { shape: 'torus', size: [0.6, 0.06], pos: [0, 0.65, 0], rot: [Math.PI / 2, 0, 0], mat: 'dark' },
  ],
  waterOxygenPlant: [
    { shape: 'box', size: [1.6, 0.6, 1], pos: [0, 0.3, 0], mat: 'white' },
    { shape: 'cyl', size: [0.3, 1.2], pos: [-0.5, 0.6, 0.6], mat: 'glowBlue' },
    { shape: 'cyl', size: [0.3, 1.2], pos: [0.5, 0.6, 0.6], mat: 'glass' },
    { shape: 'cyl', size: [0.1, 1.2], pos: [0, 0.6, -0.5], mat: 'metal' },
  ],
  greenhouse: [
    { shape: 'box', size: [2.6, 0.15, 1.8], pos: [0, 0.08, 0], mat: 'metal' },
    { shape: 'cyl', size: [0.9, 2.5], pos: [0, 0.15, 0], rot: [0, 0, Math.PI / 2], mat: 'glass' },
    { shape: 'box', size: [2.2, 0.25, 1.2], pos: [0, 0.3, 0], mat: 'green' },
  ],
  huntingLodge: [
    { shape: 'box', size: [1.6, 0.7, 1.6], pos: [0, 0.35, 0], mat: 'dark' },
    { shape: 'cone', size: [1.1, 0.6, 4], pos: [0, 1, 0], mat: 'orange' },
    { shape: 'sphere', size: [0.1], pos: [0.8, 0.6, 0.8], mat: 'glowYellow' },
  ],
  lab: [
    { shape: 'cyl', size: [0.9, 0.8], pos: [0, 0.4, 0], mat: 'white' },
    { shape: 'dome', size: [0.85], pos: [0, 0.8, 0], mat: 'glass' },
    { shape: 'sphere', size: [0.25], pos: [0, 1.1, 0], mat: 'glowBlue' },
  ],
  diamondDrill: [
    { shape: 'box', size: [1.5, 0.4, 1.5], pos: [0, 0.2, 0], mat: 'dark' },
    { shape: 'cone', size: [0.3, 1.6], pos: [0, 1.2, 0], rot: [Math.PI, 0, 0], mat: 'metal' },
    { shape: 'box', size: [0.15, 2, 0.15], pos: [-0.6, 1, -0.6], mat: 'orange' },
    { shape: 'box', size: [0.15, 2, 0.15], pos: [0.6, 1, -0.6], mat: 'orange' },
    { shape: 'sphere', size: [0.15], pos: [0, 0.5, 0.6], mat: 'glowBlue' },
  ],
  spaceport: [
    { shape: 'cyl', size: [1.9, 0.2], pos: [0, 0.1, 0], mat: 'dark' },
    {
      shape: 'torus',
      size: [1.5, 0.05],
      pos: [0, 0.22, 0],
      rot: [Math.PI / 2, 0, 0],
      mat: 'glowYellow',
    },
    { shape: 'box', size: [0.4, 2.4, 0.4], pos: [-1.5, 1.2, -1.5], mat: 'metal' },
    { shape: 'box', size: [1.5, 0.15, 0.2], pos: [-0.8, 2.2, -1.5], mat: 'metal' },
  ],
};
