import { BUILDINGS, buildingLevel } from '../content/buildings';
import { UNITS, type Hits } from '../content/units';
import type { Entity } from './entity';

/** Where a thing fights: on the ground, in the air above the ground, or in space (orbit). */
export type Layer = 'ground' | 'air' | 'space';

export function layerOf(e: Entity): Layer {
  if (!e.unit) return 'ground';
  const def = UNITS[e.unit.type];
  if (def.space) return 'space';
  return def.air ? 'air' : 'ground';
}

/** What the weapon of a unit or building can hit. */
export function weaponHits(e: Entity): Hits | 'space' {
  if (e.unit) return UNITS[e.unit.type].hits ?? 'ground';
  if (e.building && e.building.level >= 1)
    return buildingLevel(BUILDINGS[e.building.type], e.building.level).weapon?.hits ?? 'ground';
  return 'ground';
}

/** Can this shooter's weapon reach the target's layer? */
export function canHit(shooter: Entity, target: Entity): boolean {
  const hits = weaponHits(shooter);
  const layer = layerOf(target);
  if (hits === 'all') return layer !== 'space';
  return hits === layer;
}
