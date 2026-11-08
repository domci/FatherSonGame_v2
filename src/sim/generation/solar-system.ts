import type { ResourceId } from '../../content/resources';
import { createRng, type Rng } from '../rng';
import { MINUTE } from '../clock';
import { planetName } from './names';

export type BodyKind = 'rocky' | 'gas' | 'ice';

export interface Body {
  id: string;
  name: string;
  kind: BodyKind;
  /** Distance from the sun in map units. */
  orbitRadius: number;
  /** Time for one orbit in ms. */
  orbitPeriod: number;
  /** Start angle in radians. */
  phase: number;
  /** Visual size. */
  radius: number;
  /** Base color as hex number. */
  color: number;
  /** What mining ships can get here. */
  mineable: ResourceId[];
  /** 1 = normal sunlight. Closer to the sun = more. */
  solarFactor: number;
}

export interface AsteroidBelt {
  inner: number;
  outer: number;
  mineable: ResourceId[];
}

export interface SolarSystem {
  seed: number;
  sunRadius: number;
  bodies: Body[];
  belt: AsteroidBelt;
  homeBodyId: string;
  alienBodyId: string;
}

export const BELT_ID = 'belt';
const REFERENCE_RADIUS = 18;

export function solarFactor(orbitRadius: number): number {
  const f = (REFERENCE_RADIUS / orbitRadius) ** 2;
  return Math.round(Math.min(2, Math.max(0.3, f)) * 100) / 100;
}

const KIND_COLORS: Record<BodyKind, readonly number[]> = {
  rocky: [0x9c7b62, 0xb5a48a, 0x7d6a5b, 0xa0593e, 0x8a8f96],
  gas: [0xd9a066, 0xc9b28a, 0x7fa4c9, 0xe0c27a, 0xb07fbf],
  ice: [0xbfe3f2, 0x9fd0e6, 0xd8eef7],
};

const KIND_MINEABLE: Record<BodyKind, ResourceId[]> = {
  rocky: ['regolith', 'diamonds'],
  gas: ['gas'],
  ice: ['water'],
};

function makeBody(rng: Rng, index: number, orbitRadius: number, kind: BodyKind): Body {
  const size = kind === 'gas' ? rng.range(2.2, 3.4) : rng.range(0.8, 1.4);
  return {
    id: `p${index}`,
    name: planetName(rng.pick),
    kind,
    orbitRadius,
    orbitPeriod: Math.round(orbitRadius * rng.range(2.5, 3.5) * MINUTE),
    phase: rng.range(0, Math.PI * 2),
    radius: Math.round(size * 100) / 100,
    color: rng.pick(KIND_COLORS[kind]),
    mineable: KIND_MINEABLE[kind],
    solarFactor: solarFactor(orbitRadius),
  };
}

function kindFor(rng: Rng, orbitRadius: number, beltOuter: number): BodyKind {
  if (orbitRadius < beltOuter) return 'rocky';
  return rng.next() < 0.75 ? 'gas' : 'ice';
}

/** Makes a random solar system. Same seed = same system. */
export function generateSolarSystem(seed: number): SolarSystem {
  const rng = createRng(seed ^ 0x5eed);
  const count = rng.int(5, 8);
  const beltIndex = rng.int(2, 3);
  const bodies: Body[] = [];
  let radius = rng.range(9, 12);
  let belt: AsteroidBelt = { inner: 0, outer: 0, mineable: ['metal', 'regolith'] };
  for (let i = 0; i < count; i++) {
    if (i === beltIndex) {
      belt = { inner: radius, outer: radius + 4, mineable: ['metal', 'regolith'] };
      radius += 7;
    }
    const outer = belt.outer || Infinity;
    bodies.push(makeBody(rng, i, Math.round(radius * 10) / 10, kindFor(rng, radius, outer)));
    radius += rng.range(5, 8) + (i > beltIndex ? 3 : 0);
  }
  const rocky = bodies.filter((b) => b.kind === 'rocky');
  const home = rocky[rocky.length - 1] ?? bodies[0];
  const alien = rocky.find((b) => b !== home) ?? bodies[bodies.length - 1];
  if (!home || !alien) throw new Error('Solar system without planets');
  return { seed, sunRadius: 4, bodies, belt, homeBodyId: home.id, alienBodyId: alien.id };
}

/** Position of a body at a game time. Sun is at (0, 0). */
export function bodyPosition(body: Body, time: number): { x: number; y: number } {
  const angle = body.phase + (Math.PI * 2 * time) / body.orbitPeriod;
  return { x: Math.cos(angle) * body.orbitRadius, y: Math.sin(angle) * body.orbitRadius };
}

export function findBody(system: SolarSystem, id: string): Body | undefined {
  return system.bodies.find((b) => b.id === id);
}
