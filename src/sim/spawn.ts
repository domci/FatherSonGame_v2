import { BUILDINGS, buildingLevel, type BuildingId } from '../content/buildings';
import { UNITS, type UnitId } from '../content/units';
import type { Entity, PlayerId, Vec2 } from './entity';
import type { GameState } from './state';

/** Adds an entity to the world and gives it the next free id. */
export function spawn(state: GameState, data: Omit<Entity, 'id'>): Entity {
  const entity: Entity = { id: state.nextId++, ...data };
  return state.world.add(entity);
}

export function findEntity(state: GameState, id: number): Entity | undefined {
  for (const e of state.world) if (e.id === id) return e;
  return undefined;
}

export function buildingCenter(type: BuildingId, tileX: number, tileY: number): Vec2 {
  const size = BUILDINGS[type].size;
  return { x: tileX + size / 2, y: tileY + size / 2 };
}

export function spawnBuilding(
  state: GameState,
  owner: PlayerId,
  zone: string,
  b: { type: BuildingId; tileX: number; tileY: number; level: number },
): Entity {
  const max = buildingLevel(BUILDINGS[b.type], Math.max(1, b.level)).hp;
  return spawn(state, {
    owner,
    zone,
    position: buildingCenter(b.type, b.tileX, b.tileY),
    building: { ...b },
    health: { hp: b.level === 0 ? max * 0.1 : max, max },
  });
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
