import type { ViewName } from './views/view';

/**
 * One zoom value for the whole game, from 0 (close to the ground) to 3 (whole solar system).
 * 0..1 = surface, 1..2 = planet, 2..3 = solar system. There are no cuts: the camera moves
 * smoothly, and around 1 the surface picture fades into the planet picture.
 */
export const Z_MAX = 3;
/** Where each zoom level rests when the player picks it with a button. */
export const Z_REST: Record<ViewName, number> = { surface: 0.6, planet: 1.6, system: 2.75 };
/** Closest zoom on a planet that one cannot land on. */
export const Z_NO_SURFACE = 1.12;
/** The surface fades into the planet between these two values. */
const FADE_FROM = 0.93;
const FADE_TO = 1.07;

export function smoothstep(a: number, b: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/** Geometric steps: each zoom step changes the distance by the same factor. */
function expLerp(near: number, far: number, t: number): number {
  return near * Math.pow(far / near, t);
}

export function levelOf(z: number): ViewName {
  if (z < 1) return 'surface';
  return z < 2 ? 'planet' : 'system';
}

/** 0 = only the surface is drawn, 1 = only space, between = both, mixed. */
export function spaceShare(z: number): number {
  return smoothstep(FADE_FROM, FADE_TO, z);
}

/** Surface camera: distance to the ground point it looks at. */
export function surfaceDistance(z: number): number {
  return expLerp(6, 42, z);
}

/** Surface camera: 0 = free tilt, 1 = looks straight down (just before the fade). */
export function surfaceTopDown(z: number): number {
  return smoothstep(0.62, 0.98, z);
}

/** Space camera near a planet: height above the ground, in planet radii. */
export function planetAltitude(z: number): number {
  return expLerp(0.05, 3.2, z - 1);
}

/** Space camera: 0 = looks at the base on the planet, 1 = at the planet center. */
export function baseToCenter(z: number): number {
  return smoothstep(1, 1.6, z);
}

/** Space camera: 0 = looks at the planet, 1 = at the sun (whole system). */
export function planetToSun(z: number): number {
  return smoothstep(2, 2.9, z);
}

/** Space camera distance (to what it looks at) between planet and whole system. */
export function systemDistance(z: number, planetRadius: number): number {
  return expLerp(planetRadius * 4.2, 165, z - 2);
}

/** How strongly the space camera turns toward the base (near the ground: fully). */
export function turnToBase(z: number): number {
  return smoothstep(1.5, 1.02, z);
}

/** Small craters and rocks on the planet: only close to the ground (they cost much). */
export function closeDetail(z: number): number {
  return 1 - smoothstep(1.2, 1.5, z);
}
