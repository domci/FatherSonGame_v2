import { surfaceHeight, type SurfaceMap } from '../sim/generation/surface';
import { fbm, seededRandom } from './noise';

interface MicroCrater {
  x: number;
  y: number;
  r: number;
  d: number;
}

const cache = new WeakMap<SurfaceMap, MicroCrater[]>();

/** Many small craters, only for looks. Same map = same craters. */
function microCraters(map: SurfaceMap): MicroCrater[] {
  let list = cache.get(map);
  if (list) return list;
  const rand = seededRandom(map.size * 7919 + map.bodyId.length * 104729 + map.rocks.indexOf(true));
  list = Array.from({ length: 70 }, () => ({
    x: rand() * (map.size + 60) - 30,
    y: rand() * (map.size + 60) - 30,
    r: 0.5 + rand() * rand() * 3,
    d: 0.08 + rand() * 0.25,
  }));
  cache.set(map, list);
  return list;
}

function craterShape(dist: number): number {
  if (dist < 1) return -(1 - dist * dist);
  if (dist < 1.5) return 0.4 * Math.cos(((dist - 1) / 0.5) * Math.PI * 0.5) ** 2;
  return 0;
}

/** 0 on deposits (so pools lie flat), 1 elsewhere. */
function flatten(map: SurfaceMap, x: number, y: number): number {
  let f = 1;
  for (const d of map.deposits) {
    const dist = Math.hypot(x - (d.tileX + 1), y - (d.tileY + 1));
    f = Math.min(f, Math.max(0, Math.min(1, (dist - 1.6) / 1.5)));
  }
  return f;
}

/** Ground height used for drawing: game craters + small craters + bumps. */
export function visualHeight(map: SurfaceMap, x: number, y: number): number {
  let h = surfaceHeight(map, x, y);
  for (const c of microCraters(map)) {
    const dist = Math.hypot(x - c.x, y - c.y) / c.r;
    if (dist < 1.5) h += craterShape(dist) * c.d;
  }
  h += fbm(x * 0.35, y * 0.35, 3) * 0.6 + fbm(x * 2.2, y * 2.2, 9, 2) * 0.06;
  return h * flatten(map, x, y);
}
