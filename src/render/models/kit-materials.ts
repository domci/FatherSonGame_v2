import type { Material } from 'three/webgpu';
import { glassMaterial, solidMaterial } from '../materials';

/** Material names used in the Kenney Space Kit. */
export type KitMaterial =
  | 'metal'
  | 'metalDark'
  | 'metalRed'
  | 'dark'
  | 'crystal'
  | 'rock'
  | 'rockDark'
  | 'rockTrack'
  | '_defaultMat';

/**
 * Human colony look: white painted hull, steel grey, orange stripes.
 * The kit files are "unlit"; we give them real metal/paint materials.
 */
export const KIT_MATERIALS: Record<KitMaterial, () => Material> = {
  metal: () => solidMaterial(0xe4e8ee, { metal: 0.25, rough: 0.42 }),
  metalDark: () => solidMaterial(0x8e98a6, { metal: 0.65, rough: 0.35 }),
  metalRed: () => solidMaterial(0xf2862e, { metal: 0.3, rough: 0.45 }),
  dark: () => solidMaterial(0x30353d, { metal: 0.55, rough: 0.5 }),
  crystal: () => solidMaterial(0x7ff3ff, { glow: 1.6, metal: 0.1, rough: 0.1 }),
  rock: () => solidMaterial(0x8a7f74, { metal: 0, rough: 0.95 }),
  rockDark: () => solidMaterial(0x5d554e, { metal: 0, rough: 0.95 }),
  rockTrack: () => solidMaterial(0x9b8f82, { metal: 0, rough: 0.95 }),
  _defaultMat: () => solidMaterial(0xd5dae2, { metal: 0.3, rough: 0.45 }),
};

export const GLASS = (): Material => glassMaterial(0xcfeaff);
export const PINK_GLOW = (): Material => solidMaterial(0xff4fbf, { glow: 2.2 });
export const BLUE_GLOW = (): Material => solidMaterial(0x59c8ff, { glow: 2.2 });
