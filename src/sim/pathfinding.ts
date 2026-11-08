import type { Vec2 } from './entity';

const DIRS = [
  [1, 0, 1],
  [-1, 0, 1],
  [0, 1, 1],
  [0, -1, 1],
  [1, 1, Math.SQRT2],
  [1, -1, Math.SQRT2],
  [-1, 1, Math.SQRT2],
  [-1, -1, Math.SQRT2],
] as const;

interface Grid {
  size: number;
  blocked: readonly boolean[];
}

function isFree(grid: Grid, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < grid.size && y < grid.size && !grid.blocked[y * grid.size + x];
}

function canStep(grid: Grid, x: number, y: number, dx: number, dy: number): boolean {
  if (!isFree(grid, x + dx, y + dy)) return false;
  // No cutting corners past blocked tiles.
  return dx === 0 || dy === 0 || (isFree(grid, x + dx, y) && isFree(grid, x, y + dy));
}

function rebuild(cameFrom: Map<number, number>, end: number, size: number): Vec2[] {
  const path: Vec2[] = [];
  let current: number | undefined = end;
  while (current !== undefined) {
    path.unshift({ x: (current % size) + 0.5, y: Math.floor(current / size) + 0.5 });
    current = cameFrom.get(current);
  }
  return path;
}

function lowest(open: Set<number>, f: Map<number, number>): number {
  let best = -1;
  let bestF = Infinity;
  for (const n of open) {
    const v = f.get(n) ?? Infinity;
    if (v < bestF) [best, bestF] = [n, v];
  }
  return best;
}

interface Search {
  grid: Grid;
  current: number;
  goal: number;
  open: Set<number>;
  cameFrom: Map<number, number>;
  g: Map<number, number>;
  f: Map<number, number>;
  h: (n: number) => number;
}

function neighbour(grid: Grid, cx: number, cy: number, dx: number, dy: number): number {
  const nx = cx + dx;
  const ny = cy + dy;
  if (nx < 0 || ny < 0 || nx >= grid.size || ny >= grid.size) return -1;
  return ny * grid.size + nx;
}

function expand(s: Search): void {
  const size = s.grid.size;
  const cx = s.current % size;
  const cy = Math.floor(s.current / size);
  for (const [dx, dy, cost] of DIRS) {
    const next = neighbour(s.grid, cx, cy, dx, dy);
    if (next < 0 || (next !== s.goal && !canStep(s.grid, cx, cy, dx, dy))) continue;
    const tentative = (s.g.get(s.current) ?? Infinity) + cost;
    if (tentative >= (s.g.get(next) ?? Infinity)) continue;
    s.cameFrom.set(next, s.current);
    s.g.set(next, tentative);
    s.f.set(next, tentative + s.h(next));
    s.open.add(next);
  }
}

/**
 * A* path on the tile grid from one tile to another. Returns tile centers.
 * Returns [] if there is no way. The goal tile itself may be blocked (e.g. walking to a building).
 */
export function findPath(grid: Grid, from: Vec2, to: Vec2, maxSteps = 4000): Vec2[] {
  const size = grid.size;
  const start = Math.floor(from.y) * size + Math.floor(from.x);
  const goal = Math.floor(to.y) * size + Math.floor(to.x);
  const gx = goal % size;
  const gy = Math.floor(goal / size);
  const h = (n: number): number => Math.hypot((n % size) - gx, Math.floor(n / size) - gy);
  const open = new Set([start]);
  const cameFrom = new Map<number, number>();
  const g = new Map([[start, 0]]);
  const f = new Map([[start, h(start)]]);
  for (let steps = 0; open.size > 0 && steps < maxSteps; steps++) {
    const current = lowest(open, f);
    if (current === goal) return rebuild(cameFrom, current, size);
    open.delete(current);
    expand({ grid, current, goal, open, cameFrom, g, f, h });
  }
  return [];
}
