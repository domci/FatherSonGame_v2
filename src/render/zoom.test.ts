import { describe, expect, it } from 'vitest';
import {
  baseToCenter,
  levelOf,
  planetAltitude,
  planetToSun,
  spaceShare,
  surfaceTopDown,
  systemDistance,
  Z_NO_SURFACE,
  Z_REST,
} from './zoom';

describe('one zoom from the ground to the solar system', () => {
  it('names the level of each zoom value', () => {
    expect(levelOf(Z_REST.surface)).toBe('surface');
    expect(levelOf(Z_REST.planet)).toBe('planet');
    expect(levelOf(Z_REST.system)).toBe('system');
  });

  it('has no jumps where the camera rules change', () => {
    const r = 1.2;
    // Planet close-up -> system: same distance from the planet center at z = 2.
    expect(r * (1 + planetAltitude(2))).toBeCloseTo(systemDistance(2, r), 5);
    expect(planetToSun(2)).toBe(0);
    expect(baseToCenter(1)).toBe(0);
  });

  it('the surface looks straight down before it fades into space', () => {
    expect(surfaceTopDown(Z_REST.surface)).toBe(0);
    expect(surfaceTopDown(0.99)).toBe(1);
    expect(spaceShare(0.9)).toBe(0);
    expect(spaceShare(1.1)).toBe(1);
    expect(spaceShare(1)).toBeCloseTo(0.5, 5);
  });

  it('a planet without a surface stops above the fade', () => {
    expect(spaceShare(Z_NO_SURFACE)).toBe(1);
  });
});
