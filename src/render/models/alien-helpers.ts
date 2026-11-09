import type { MaterialName, ModelPart, Part } from './parts';

/** Flat living ground under an alien building, with small glowing bumps. */
export function mound(size: number, glow: MaterialName = 'glowGreen'): Part[] {
  const r = size * 0.52;
  const bumps: Part[] = Array.from({ length: Math.round(size * 3) }, (_, i) => {
    const a = (i / (size * 3)) * Math.PI * 2 + 0.4;
    const d = r * (0.72 + ((i * 37) % 10) / 50);
    return {
      shape: 'sphere',
      size: [0.05 + (i % 3) * 0.015],
      pos: [Math.cos(a) * d, 0.06, Math.sin(a) * d],
      mat: glow,
    };
  });
  return [
    { shape: 'sphere', size: [r], scale: [1, 0.14, 1], pos: [0, 0, 0], mat: 'fleshDark' },
    {
      shape: 'torus',
      size: [r * 0.92, 0.05],
      pos: [0, 0.03, 0],
      rot: [Math.PI / 2, 0, 0],
      mat: 'chitin',
    },
    ...bumps,
  ];
}

/** Horns around a center, bending outward. */
export function horns(
  n: number,
  r: number,
  h: number,
  mat: MaterialName = 'bone',
  y = 0.05,
): Part[] {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return {
      shape: 'tendril',
      size: [0.06, h, h * 0.35],
      pos: [Math.cos(a) * r, y, Math.sin(a) * r],
      rot: [0, -a, 0],
      mat,
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

/** An egg-shaped pod. */
export function pod(
  x: number,
  z: number,
  r: number,
  h: number,
  mat: MaterialName = 'chitin',
): Part {
  return { shape: 'sphere', size: [r], scale: [1, h / r, 1], pos: [x, h * 0.55, z], mat };
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

/** A glowing mushroom. */
export function mushroom(x: number, z: number, h: number, r: number): Part[] {
  return [
    { shape: 'cyl', size: [r * 0.22, h], pos: [x, h / 2, z], mat: 'bone' },
    { shape: 'dome', size: [r], scale: [1, 0.55, 1], pos: [x, h, z], mat: 'glowViolet' },
  ];
}

export type { ModelPart };
