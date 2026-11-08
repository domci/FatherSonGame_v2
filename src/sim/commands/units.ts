import { BUILDINGS } from '../../content/buildings';
import { UNITS, type UnitId } from '../../content/units';
import type { Entity, PlayerId, Vec2 } from '../entity';
import { getPlayer } from '../game';
import { blockedTiles } from '../occupancy';
import { findPath } from '../pathfinding';
import { findEntity } from '../spawn';
import { playerStats } from '../stats';
import type { GameState } from '../state';
import { pay } from '../wallet';
import { fail, OK, type CommandResult } from './result';

export interface MoveCommand {
  type: 'move';
  player: PlayerId;
  unitIds: number[];
  target: Vec2;
}

export interface AttackCommand {
  type: 'attack';
  player: PlayerId;
  unitIds: number[];
  targetId: number;
}

export interface TrainCommand {
  type: 'train';
  player: PlayerId;
  buildingId: number;
  unit: UnitId;
}

const MAX_QUEUE = 5;

function ownUnits(state: GameState, player: PlayerId, ids: number[]): Entity[] {
  return ids
    .map((id) => findEntity(state, id))
    .filter((e): e is Entity => !!e?.unit && e.owner === player && !e.ship && !e.busyWith);
}

/** Plans a path for one unit. Flying units go straight. */
export function sendTo(state: GameState, unit: Entity, target: Vec2): boolean {
  if (!unit.unit || !unit.position || !unit.zone) return false;
  const def = UNITS[unit.unit.type];
  let path: Vec2[] = [{ ...target }];
  if (!def.flying) {
    const map = state.surfaces[unit.zone];
    if (!map) return false;
    path = findPath(
      { size: map.size, blocked: blockedTiles(state, unit.zone) },
      unit.position,
      target,
    );
    if (path.length === 0) return false;
    path[path.length - 1] = { ...target };
  }
  state.world.addComponent(unit, 'mover', { path, speed: def.speed, flying: def.flying });
  return true;
}

export function move(state: GameState, cmd: MoveCommand): CommandResult {
  const units = ownUnits(state, cmd.player, cmd.unitIds);
  if (units.length === 0) return fail('Keine Einheit ausgewählt.');
  units.forEach((u, i) => {
    if (u.attacker) delete u.attacker.targetId;
    const offset = { x: (i % 3) * 0.8 - 0.8, y: Math.floor(i / 3) * 0.8 };
    sendTo(state, u, { x: cmd.target.x + offset.x, y: cmd.target.y + offset.y });
  });
  return OK;
}

export function attack(state: GameState, cmd: AttackCommand): CommandResult {
  const target = findEntity(state, cmd.targetId);
  if (!target?.health || target.owner === cmd.player) return fail('Kein gültiges Ziel.');
  const units = ownUnits(state, cmd.player, cmd.unitIds).filter((u) => u.attacker);
  if (units.length === 0) return fail('Diese Einheiten können nicht kämpfen.');
  for (const u of units) if (u.attacker) u.attacker.targetId = target.id;
  return OK;
}

function queuedHousing(state: GameState, player: PlayerId): number {
  let sum = 0;
  for (const b of state.world.with('training')) {
    if (b.owner !== player) continue;
    sum += [b.training.unit, ...b.training.queue].reduce((s, u) => s + UNITS[u].housing, 0);
  }
  return sum;
}

export function train(state: GameState, cmd: TrainCommand): CommandResult {
  const b = findEntity(state, cmd.buildingId);
  if (!b?.building || b.owner !== cmd.player || b.building.level < 1)
    return fail('Gebäude nicht bereit.');
  if (!BUILDINGS[b.building.type].trains?.includes(cmd.unit))
    return fail('Kann diese Einheit nicht bauen.');
  const def = UNITS[cmd.unit];
  const stats = playerStats(state, cmd.player);
  if (stats.housingUsed + queuedHousing(state, cmd.player) + def.housing > stats.housing) {
    return fail('Kein Platz mehr. Baut mehr Wohn-Kuppeln.');
  }
  if (b.training && b.training.queue.length >= MAX_QUEUE) return fail('Warteschlange ist voll.');
  if (!pay(getPlayer(state, cmd.player), def.cost)) return fail('Nicht genug Rohstoffe.');
  if (b.training) b.training.queue.push(cmd.unit);
  else
    state.world.addComponent(b, 'training', {
      unit: cmd.unit,
      finishAt: state.time + def.trainSeconds * 1000,
      queue: [],
    });
  return OK;
}
