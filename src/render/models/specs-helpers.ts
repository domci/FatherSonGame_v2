import type { KitPart, MaterialName, Part } from './parts';

/** n small lights in a circle. */
export function ringOfLights(
  n: number,
  radius: number,
  y: number,
  mat: MaterialName = 'window',
  size = 0.05,
): Part[] {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return {
      shape: 'sphere',
      size: [size],
      pos: [Math.cos(a) * radius, y, Math.sin(a) * radius],
      mat,
    };
  });
}

/** A row of n boxes along x. */
export function row(
  n: number,
  start: number,
  step: number,
  part: Omit<Part, 'pos'> & { pos: [number, number, number] },
): Part[] {
  return Array.from({ length: n }, (_, i) => ({
    ...part,
    pos: [start + i * step, part.pos[1], part.pos[2]],
  }));
}

/** Landing pad that fills a building of `size` tiles. */
export function pad(size: number): KitPart {
  const s = (size / 2) * 0.96;
  return { kit: 'platform_large', scale: [s, 1, s] };
}

/** Small warm lights on the four corners of a pad. */
export function cornerLights(size: number): Part[] {
  const d = (size / 2) * 0.88;
  return [
    [d, d],
    [-d, d],
    [d, -d],
    [-d, -d],
  ].map(([x = 0, z = 0]) => ({ shape: 'sphere', size: [0.05], pos: [x, 0.14, z], mat: 'window' }));
}
