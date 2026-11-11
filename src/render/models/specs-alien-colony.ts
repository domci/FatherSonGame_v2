import { mound, mushroom, pod, ribs, veins } from './alien-helpers';
import type { ModelPart } from './parts';
import type { ColonyId } from './specs-colony';

/** Alien healing nest and spore garden. */
export const ALIEN_COLONY: Record<ColonyId, readonly ModelPart[]> = {
  medbay: [
    ...mound(2, 'glowCyan'),
    pod(0, 0, 0.42, 0.55, 'chitin'),
    ...ribs(0, 0, 0.42, [0.2, 0.38]),
    { shape: 'cyl', size: [0.3, 0.05], pos: [0, 0.62, 0], mat: 'glowCyan' },
    pod(0.6, 0.5, 0.12, 0.2, 'glowCyan'),
    pod(-0.55, 0.55, 0.1, 0.18, 'glowCyan'),
  ],
  park: [
    ...mound(3, 'glowViolet'),
    ...veins(6, 1.2, 'glowViolet'),
    ...mushroom(-0.5, -0.4, 0.55, 0.32),
    ...mushroom(0.45, -0.35, 0.4, 0.26),
    ...mushroom(0.1, 0.5, 0.65, 0.36),
    ...mushroom(-0.65, 0.45, 0.3, 0.2),
    { shape: 'sphere', size: [0.5], scale: [1, 0.25, 1], pos: [0.55, 0.06, 0.45], mat: 'membrane' },
  ],
};
