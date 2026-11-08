import { describe, expect, it } from 'vitest';
import { createRng } from './rng';

describe('rng', () => {
  it('gives the same numbers for the same seed', () => {
    const a = createRng(42);
    const b = createRng(42);
    const listA = Array.from({ length: 5 }, () => a.next());
    const listB = Array.from({ length: 5 }, () => b.next());
    expect(listA).toEqual(listB);
  });

  it('gives different numbers for different seeds', () => {
    expect(createRng(1).next()).not.toBe(createRng(2).next());
  });

  it('can continue from a saved state', () => {
    const a = createRng(7);
    a.next();
    const resumed = createRng(a.state());
    expect(resumed.next()).toBe(a.next());
  });

  it('int stays in range', () => {
    const r = createRng(3);
    for (let i = 0; i < 1000; i++) {
      const v = r.int(2, 5);
      expect(v).toBeGreaterThanOrEqual(2);
      expect(v).toBeLessThanOrEqual(5);
    }
  });

  it('pick throws on empty list', () => {
    expect(() => createRng(1).pick([])).toThrow();
  });
});
