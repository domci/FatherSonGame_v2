import { describe, expect, it } from 'vitest';
import { bodyPosition, generateSolarSystem, solarFactor } from './solar-system';

describe('solar system generator', () => {
  it('same seed gives the same system', () => {
    expect(generateSolarSystem(123)).toEqual(generateSolarSystem(123));
  });

  it('different seeds give different systems', () => {
    expect(generateSolarSystem(1)).not.toEqual(generateSolarSystem(2));
  });

  it('has 5 to 8 planets, a belt and two different rocky home planets', () => {
    for (let seed = 0; seed < 50; seed++) {
      const s = generateSolarSystem(seed);
      expect(s.bodies.length).toBeGreaterThanOrEqual(5);
      expect(s.bodies.length).toBeLessThanOrEqual(8);
      expect(s.belt.outer).toBeGreaterThan(s.belt.inner);
      expect(s.homeBodyId).not.toBe(s.alienBodyId);
      const home = s.bodies.find((b) => b.id === s.homeBodyId);
      expect(home?.kind).toBe('rocky');
    }
  });

  it('gives every planet its own name', () => {
    for (let seed = 0; seed < 200; seed++) {
      const names = generateSolarSystem(seed).bodies.map((b) => b.name);
      expect(new Set(names).size).toBe(names.length);
    }
  });

  it('always has a gas planet (fuel for planes and war ships)', () => {
    for (let seed = 0; seed < 300; seed++) {
      const gas = generateSolarSystem(seed).bodies.filter((b) => b.kind === 'gas');
      expect(gas.length).toBeGreaterThan(0);
      expect(gas[0]?.mineable).toEqual(['gas']);
    }
  });

  it('planets closer to the sun get more sunlight', () => {
    expect(solarFactor(10)).toBeGreaterThan(solarFactor(30));
    expect(solarFactor(1)).toBe(2);
    expect(solarFactor(1000)).toBe(0.3);
  });

  it('planets move on their orbit', () => {
    const body = generateSolarSystem(5).bodies[0];
    if (!body) throw new Error('no body');
    const a = bodyPosition(body, 0);
    const b = bodyPosition(body, body.orbitPeriod / 4);
    expect(Math.hypot(a.x, a.y)).toBeCloseTo(body.orbitRadius);
    expect(a).not.toEqual(b);
    const full = bodyPosition(body, body.orbitPeriod);
    expect(full.x).toBeCloseTo(a.x);
  });
});
