import { createRng } from '../rng';
import { makeBody, type Body, type SolarSystem } from './solar-system';

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/** Home orbit with the fewest planets on it (first one on a tie). */
function emptiestHomeOrbit(system: SolarSystem): Body | undefined {
  const homes = system.bodies.filter((b) => b.kind === 'rocky' && system.homes.includes(b.id));
  const onOrbit = (b: Body): number =>
    system.bodies.filter((x) => x.orbitRadius === b.orbitRadius).length;
  let best: Body | undefined;
  for (const b of homes) if (!best || onOrbit(b) < onOrbit(best)) best = b;
  return best;
}

/**
 * Online worlds grow (M7+): one more home planet for one more person. It shares the orbit of
 * a home planet (same sunlight, same year), at another place on that orbit. Same system = same result.
 */
export function addHomePlanet(system: SolarSystem): string {
  const base = emptiestHomeOrbit(system);
  if (!base) throw new Error('Solar system without home planets');
  const index = system.homes.length;
  const rng = createRng(system.seed ^ (0x9e37 * (index + 1)));
  const names = new Set(system.bodies.map((b) => b.name));
  const next = Math.max(...system.bodies.map((b) => Number(b.id.slice(1)) || 0)) + 1;
  const twin = makeBody(rng, next, base.orbitRadius, 'rocky', names);
  const onOrbit = system.bodies.filter((b) => b.orbitRadius === base.orbitRadius).length;
  twin.orbitPeriod = base.orbitPeriod;
  twin.phase = (base.phase + onOrbit * GOLDEN_ANGLE) % (Math.PI * 2);
  system.bodies.push(twin);
  system.homes.push(twin.id);
  return twin.id;
}
