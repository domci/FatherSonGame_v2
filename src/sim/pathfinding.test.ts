import { describe, expect, it } from 'vitest';
import { findPath } from './pathfinding';

function grid(rows: string[]) {
  const size = rows.length;
  return {
    size,
    blocked: rows
      .join('')
      .split('')
      .map((c) => c === '#'),
  };
}

describe('pathfinding', () => {
  it('finds a straight path', () => {
    const path = findPath(
      grid(['....', '....', '....', '....']),
      { x: 0.5, y: 0.5 },
      { x: 3.5, y: 0.5 },
    );
    expect(path[0]).toEqual({ x: 0.5, y: 0.5 });
    expect(path[path.length - 1]).toEqual({ x: 3.5, y: 0.5 });
    expect(path).toHaveLength(4);
  });

  it('goes around a wall', () => {
    const g = grid(['....', '###.', '....', '....']);
    const path = findPath(g, { x: 0.5, y: 0.5 }, { x: 0.5, y: 2.5 });
    expect(path.length).toBeGreaterThan(3);
    for (const p of path) expect(g.blocked[Math.floor(p.y) * 4 + Math.floor(p.x)]).toBe(false);
  });

  it('returns empty when there is no way', () => {
    const path = findPath(
      grid(['....', '####', '....', '....']),
      { x: 0.5, y: 0.5 },
      { x: 0.5, y: 3.5 },
    );
    expect(path).toEqual([]);
  });

  it('may end on a blocked goal tile', () => {
    const path = findPath(
      grid(['....', '...#', '....', '....']),
      { x: 0.5, y: 0.5 },
      { x: 3.5, y: 1.5 },
    );
    expect(path[path.length - 1]).toEqual({ x: 3.5, y: 1.5 });
  });
});

describe('pathfinding when the goal cannot be reached', () => {
  it('goes as close as possible with partial = true', () => {
    const path = findPath(
      grid(['....', '####', '....', '....']),
      { x: 0.5, y: 0.5 },
      { x: 1.5, y: 3.5 },
      true,
    );
    expect(path[path.length - 1]).toEqual({ x: 1.5, y: 0.5 });
  });

  it('is fast on a big open map', () => {
    const size = 48;
    const g = { size, blocked: new Array<boolean>(size * size).fill(false) };
    for (let y = 0; y < size - 2; y++) g.blocked[y * size + 24] = true;
    const t = performance.now();
    for (let i = 0; i < 50; i++) findPath(g, { x: 1, y: 1 }, { x: 46, y: 1 });
    expect(performance.now() - t).toBeLessThan(500);
  });
});
