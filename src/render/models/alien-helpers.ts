import type { KitPart, MaterialName, ModelPart, Part } from './parts';

/** Living ground under an alien building: roots, chitin rim, glowing bumps (Blender model 'mound'). */
export function mound(size: number, glow: MaterialName = 'glowGreen'): KitPart[] {
  const r = size * 0.52;
  return [{ kit: 'mound', scale: [r, r, r], mats: { glow } }];
}

/** Ridged bone horns around a center, bending outward (Blender model 'horn'). */
export function horns(
  n: number,
  r: number,
  h: number,
  mat: MaterialName = 'bone',
  y = 0.05,
): KitPart[] {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return {
      kit: 'horn',
      scale: h,
      pos: [Math.cos(a) * r, y, Math.sin(a) * r],
      rot: [0, -a, 0],
      mats: { bone: mat },
    };
  });
}

/** Glowing veins that run over the ground from the center. */
export function veins(n: number, len: number, mat: MaterialName = 'glowGreen'): Part[] {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 + 0.25;
    return {
      shape: 'tendril',
      size: [0.025, len, len * 0.2],
      pos: [Math.cos(a) * 0.25, 0.07, Math.sin(a) * 0.25],
      rot: [Math.PI / 2 - 0.08, 0, a - Math.PI / 2],
      mat,
    };
  });
}

/** An egg-shaped chitin pod with lobes and glowing veins (Blender model 'pod', radius 1, height 2). */
export function pod(
  x: number,
  z: number,
  r: number,
  h: number,
  mat: MaterialName = 'chitin',
): KitPart {
  return { kit: 'pod', scale: [r, h, r], pos: [x, -h * 0.45, z], mats: { shell: mat } };
}

/** Ribs around a pod. */
export function ribs(
  x: number,
  z: number,
  r: number,
  ys: number[],
  mat: MaterialName = 'chitinLight',
): Part[] {
  return ys.map((y, i) => ({
    shape: 'torus',
    size: [r * (1 - Math.abs(i - (ys.length - 1) / 2) * 0.18), 0.035],
    pos: [x, y, z],
    rot: [Math.PI / 2, 0, 0],
    mat,
  }));
}

/** A glowing mushroom with gills and spots (Blender model 'mushroom'). */
export function mushroom(x: number, z: number, h: number, r: number): KitPart[] {
  return [{ kit: 'mushroom', scale: [r, h, r], pos: [x, 0, z] }];
}

export type { ModelPart };
