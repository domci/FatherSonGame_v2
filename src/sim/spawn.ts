import { BUILDINGS, buildingLevel, type BuildingId } from '../content/buildings';
import { UNITS, type UnitId } from '../content/units';
import type { Entity, PlayerId, Vec2 } from './entity';
import type { GameState } from './state';

/** Adds an entity to the world and gives it the next free id. */
export function spawn(state: GameState, data: Omit<Entity, 'id'>): Entity {
  const entity: Entity = { id: state.nextId++, ...data };
  return state.world.add(entity);
}

const indexes = new WeakMap<GameState['world'], Map<number, Entity>>();

/** id -> entity, kept up to date by the world's add/remove events. */
function indexOf(world: GameState['world']): Map<number, Entity> {
  const old = indexes.get(world);
  if (old) return old;
  const index = new Map<number, Entity>();
  for (const e of world) index.set(e.id, e);
  world.onEntityAdded.subscribe((e) => index.set(e.id, e));
  world.onEntityRemoved.subscribe((e) => index.delete(e.id));
  indexes.set(world, index);
  return index;
}

export function findEntity(state: GameState, id: number): Entity | undefined {
  return indexOf(state.world).get(id);
}

export function buildingCenter(type: BuildingId, tileX: number, tileY: number): Vec2 {
  const size = BUILDINGS[type].size;
  return { x: tileX + size / 2, y: tileY + size / 2 };
}

/** Weapon and shield of a finished building (they change with the level). */
export function equipBuilding(state: GameState, e: Entity): void {
  if (!e.building || e.building.level < 1) return;
  const lvl = buildingLevel(BUILDINGS[e.building.type], e.building.level);
  if (lvl.weapon) {
    const old = e.attacker;
    const attacker = { ...lvl.weapon, readyAt: old?.readyAt ?? 0, targetId: old?.targetId };
    if (old) Object.assign(old, attacker);
    else state.world.addComponent(e, 'attacker', attacker);
  }
  if (lvl.shield) {
    const { capacity, radius } = lvl.shield;
    const shield = { hp: e.shield?.hp ?? capacity, max: capacity, radius, hitAt: 0 };
    if (e.shield) Object.assign(e.shield, shield);
    else state.world.addComponent(e, 'shield', shield);
  }
}

export function spawnBuilding(
  state: GameState,
  owner: PlayerId,
  zone: string,
  b: { type: BuildingId; tileX: number; tileY: number; level: number },
): Entity {
  const max = buildingLevel(BUILDINGS[b.type], Math.max(1, b.level)).hp;
  const e = spawn(state, {
    owner,
    zone,
    position: buildingCenter(b.type, b.tileX, b.tileY),
    building: { ...b },
    health: { hp: b.level === 0 ? max * 0.1 : max, max },
  });
  equipBuilding(state, e);
  return e;
}

export function spawnUnit(
  state: GameState,
  owner: PlayerId,
  zone: string,
  type: UnitId,
  at: Vec2,
): Entity {
  const def = UNITS[type];
  const entity: Omit<Entity, 'id'> = {
    owner,
    zone,
    position: { ...at },
    unit: { type },
    health: { hp: def.hp, max: def.hp },
  };
  if (def.damage > 0) {
    entity.attacker = {
      damage: def.damage,
      range: def.range,
      cooldownMs: def.cooldownMs,
      readyAt: 0,
    };
  }
  return spawn(state, entity);
}

/** A war ship waits in orbit above `at` (no position on the ground). */
export function spawnWarship(state: GameState, owner: PlayerId, at: string, type: UnitId): Entity {
  const def = UNITS[type];
  return spawn(state, {
    owner,
    zone: 'space',
    unit: { type },
    health: { hp: def.hp, max: def.hp },
    attacker: { damage: def.damage, range: 0, cooldownMs: def.cooldownMs, readyAt: 0 },
    orbit: { at, departAt: state.time, arriveAt: state.time },
  });
}
