/**
 * Seeded random numbers (mulberry32).
 * Same seed = same numbers on every computer. Needed for saves and later multiplayer.
 * The state is a plain number, so it can be saved as JSON.
 */
export interface Rng {
  /** Float in [0, 1). */
  next(): number;
  /** Integer in [min, max] (both inclusive). */
  int(min: number, max: number): number;
  /** Float in [min, max). */
  range(min: number, max: number): number;
  pick<T>(items: readonly T[]): T;
  /** Current internal state, for saving. */
  state(): number;
}

export function createRng(seed: number): Rng {
  let s = seed >>> 0;
  const next = (): number => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    range: (min, max) => min + next() * (max - min),
    pick: (items) => {
      const item = items[Math.floor(next() * items.length)];
      if (item === undefined) throw new Error('pick() on empty list');
      return item;
    },
    state: () => s,
  };
}

/** Random seed for a new game (not deterministic on purpose). */
export function randomSeed(): number {
  return Math.floor(Math.random() * 2 ** 31);
}
