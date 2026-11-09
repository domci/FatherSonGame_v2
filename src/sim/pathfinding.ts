import type { Vec2 } from './entity';
import { MinHeap } from './heap';

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

function rebuild(cameFrom: Int32Array, end: number, size: number): Vec2[] {
  const path: Vec2[] = [];
  for (let current = end; current >= 0; current = cameFrom[current] ?? -1) {
    path.push({ x: (current % size) + 0.5, y: Math.floor(current / size) + 0.5 });
  }
  return path.reverse();
}

interface Search {
  grid: Grid;
  goal: number;
  heap: MinHeap;
  cameFrom: Int32Array;
  g: Float64Array;
  h: (n: number) => number;
}

function expand(s: Search, current: number): void {
  const size = s.grid.size;
  const cx = current % size;
  const cy = Math.floor(current / size);
  for (const [dx, dy, cost] of DIRS) {
    const nx = cx + dx;
    const ny = cy + dy;
    if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue;
    const next = ny * size + nx;
    if (next !== s.goal && !canStep(s.grid, cx, cy, dx, dy)) continue;
    const tentative = (s.g[current] ?? Infinity) + cost;
    if (tentative >= (s.g[next] ?? Infinity)) continue;
    s.cameFrom[next] = current;
    s.g[next] = tentative;
    s.heap.push(next, tentative + s.h(next));
  }
}

/**
 * A* path on the tile grid from one tile to another. Returns tile centers.
 * The goal tile itself may be blocked (e.g. walking to a building).
 * No way: returns [] or, with `partial`, the path to the closest reachable tile.
 */
export function findPath(grid: Grid, from: Vec2, to: Vec2, partial = false): Vec2[] {
  const size = grid.size;
  const clamp = (v: number): number => Math.min(size - 1, Math.max(0, Math.floor(v)));
  const start = clamp(from.y) * size + clamp(from.x);
  const goal = clamp(to.y) * size + clamp(to.x);
  const gx = goal % size;
  const gy = Math.floor(goal / size);
  const h = (n: number): number => Math.hypot((n % size) - gx, Math.floor(n / size) - gy);
  const s: Search = {
    grid,
    goal,
    heap: new MinHeap(),
    cameFrom: new Int32Array(size * size).fill(-1),
    g: new Float64Array(size * size).fill(Infinity),
    h,
  };
  s.g[start] = 0;
  s.heap.push(start, h(start));
  const closed = new Uint8Array(size * size);
  let best = start;
  while (s.heap.size > 0) {
    const current = s.heap.pop() ?? start;
    if (current === goal) return rebuild(s.cameFrom, current, size);
    if (closed[current]) continue;
    closed[current] = 1;
    if (h(current) < h(best)) best = current;
    expand(s, current);
  }
  return partial ? rebuild(s.cameFrom, best, size) : [];
}
