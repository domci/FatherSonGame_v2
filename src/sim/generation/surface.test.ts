import { describe, expect, it } from 'vitest';
import { generateSurface, surfaceHeight, SURFACE_SIZE } from './surface';

describe('surface generator', () => {
  it('same seed and planet give the same map', () => {
    expect(generateSurface(9, 'p1')).toEqual(generateSurface(9, 'p1'));
  });

  it('different planets give different maps', () => {
    expect(generateSurface(9, 'p1')).not.toEqual(generateSurface(9, 'p2'));
  });

  it('keeps the landing area free of rocks', () => {
    for (let seed = 0; seed < 20; seed++) {
      const map = generateSurface(seed, 'p0');
      const { tileX, tileY } = map.landing;
      for (let y = tileY; y < tileY + 4; y++) {
        for (let x = tileX; x < tileX + 4; x++) expect(map.rocks[y * SURFACE_SIZE + x]).toBe(false);
      }
    }
  });

  it('has pink and diamond deposits and two nests', () => {
    for (let seed = 0; seed < 20; seed++) {
      const map = generateSurface(seed, 'p0');
      expect(map.deposits.some((d) => d.kind === 'pink')).toBe(true);
      expect(map.deposits.some((d) => d.kind === 'diamond')).toBe(true);
      expect(map.nests).toHaveLength(2);
    }
  });

  it('craters make the ground lower in the middle', () => {
    const map = generateSurface(3, 'p0');
    const c = map.craters[0];
    if (!c) throw new Error('no crater');
    expect(surfaceHeight(map, c.x, c.y)).toBeLessThan(0);
  });
});
