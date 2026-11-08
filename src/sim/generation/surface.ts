import { createRng, type Rng } from '../rng';

export const SURFACE_SIZE = 48;

export type DepositKind = 'pink' | 'diamond';

export interface Deposit {
  kind: DepositKind;
  tileX: number;
  tileY: number;
  /** Deposits are 2x2 tiles. */
  size: number;
}

export interface Crater {
  x: number;
  y: number;
  radius: number;
  depth: number;
}

/** The flat building area of one planet. Made from the seed, so it is not saved. */
export interface SurfaceMap {
  bodyId: string;
  size: number;
  /** true = blocked by a rock. Index: y * size + x. */
  rocks: boolean[];
  deposits: Deposit[];
  craters: Crater[];
  /** Spider nest positions (tile centers). */
  nests: { x: number; y: number }[];
  /** Where the crashed ship lies (top-left tile of a 4x4 area). */
  landing: { tileX: number; tileY: number };
}

function hashString(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

function nearCenter(x: number, y: number, size: number, margin: number): boolean {
  const c = size / 2;
  return Math.abs(x - c) < margin && Math.abs(y - c) < margin;
}

function placeDeposits(rng: Rng, size: number): Deposit[] {
  const deposits: Deposit[] = [];
  const wanted: DepositKind[] = ['pink', 'pink', 'pink', 'diamond', 'diamond'];
  for (const kind of wanted) {
    const minDist = kind === 'pink' ? 5 : 10;
    for (let attempt = 0; attempt < 50; attempt++) {
      const angle = rng.range(0, Math.PI * 2);
      const dist = rng.range(minDist, minDist + 8);
      const tileX = Math.round(size / 2 + Math.cos(angle) * dist);
      const tileY = Math.round(size / 2 + Math.sin(angle) * dist);
      const clash = deposits.some(
        (d) => Math.abs(d.tileX - tileX) < 4 && Math.abs(d.tileY - tileY) < 4,
      );
      if (!clash && tileX > 2 && tileY > 2 && tileX < size - 4 && tileY < size - 4) {
        deposits.push({ kind, tileX, tileY, size: 2 });
        break;
      }
    }
  }
  return deposits;
}

function placeRocks(rng: Rng, size: number, deposits: Deposit[]): boolean[] {
  const rocks = new Array<boolean>(size * size).fill(false);
  const onDeposit = (x: number, y: number): boolean =>
    deposits.some(
      (d) => x >= d.tileX - 1 && x <= d.tileX + d.size && y >= d.tileY - 1 && y <= d.tileY + d.size,
    );
  for (let i = 0; i < size * 1.2; i++) {
    const x = rng.int(0, size - 1);
    const y = rng.int(0, size - 1);
    if (!nearCenter(x, y, size, 8) && !onDeposit(x, y)) rocks[y * size + x] = true;
  }
  return rocks;
}

function placeCraters(rng: Rng, size: number): Crater[] {
  return Array.from({ length: rng.int(5, 9) }, () => ({
    x: rng.range(0, size),
    y: rng.range(0, size),
    radius: rng.range(2, 6),
    depth: rng.range(0.3, 1.2),
  }));
}

function placeNests(rng: Rng, size: number): { x: number; y: number }[] {
  const corners = [
    { x: 5, y: 5 },
    { x: size - 6, y: 5 },
    { x: 5, y: size - 6 },
    { x: size - 6, y: size - 6 },
  ];
  const first = rng.int(0, 3);
  const second = (first + 2) % 4;
  return [corners[first], corners[second]].filter((c): c is { x: number; y: number } => !!c);
}

export function generateSurface(seed: number, bodyId: string): SurfaceMap {
  const rng = createRng(seed ^ hashString(bodyId));
  const size = SURFACE_SIZE;
  const deposits = placeDeposits(rng, size);
  return {
    bodyId,
    size,
    rocks: placeRocks(rng, size, deposits),
    deposits,
    craters: placeCraters(rng, size),
    nests: placeNests(rng, size),
    landing: { tileX: size / 2 - 2, tileY: size / 2 - 2 },
  };
}

/** Ground height at a point (for visuals and nothing else). */
export function surfaceHeight(map: SurfaceMap, x: number, y: number): number {
  let h = 0;
  for (const c of map.craters) {
    const d = Math.hypot(x - c.x, y - c.y) / c.radius;
    if (d < 1) h -= c.depth * (1 - d * d);
    else if (d < 1.4) h += c.depth * 0.35 * (1 - Math.abs(d - 1.2) / 0.2);
  }
  return h;
}
