import { BUILDINGS } from '../../content/buildings';
import { UNITS, type UnitId } from '../../content/units';
import type { Entity, PlayerId, Vec2 } from '../entity';
import { getPlayer } from '../game';
import { canHit } from '../layers';
import { hasResearch } from '../research-helpers';
import { hasFuel, needsFuel } from '../systems/fuel';
import { RESEARCH } from '../../content/research';
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
  /** Fight enemies on the way. */
  attackMove?: boolean;
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
    .filter(
      (e): e is Entity => !!e?.unit && e.owner === player && !e.ship && !e.busyWith && !e.aboard,
    );
}

/** Plans a path for one unit. Flying units go straight. `partial`: get as close as possible. */
export function sendTo(state: GameState, unit: Entity, target: Vec2, partial = true): boolean {
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
      partial,
    );
    if (path.length === 0) return false;
    const last = path[path.length - 1];
    const reached = last && Math.hypot(last.x - target.x, last.y - target.y) < 1;
    if (reached) path[path.length - 1] = { ...target };
    path.shift();
    if (path.length === 0) return false;
  }
  const mover = { path, speed: def.speed, flying: def.flying };
  // addComponent does nothing if the unit already moves, so replace the old path.
  if (unit.mover) Object.assign(unit.mover, mover, { attackMove: false });
  else state.world.addComponent(unit, 'mover', mover);
  return true;
}

/** Spots in a square block around the target, so a group does not stand on one point. */
export function formation(target: Vec2, count: number, gap = 0.9): Vec2[] {
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);
  return Array.from({ length: count }, (_, i) => ({
    x: target.x + ((i % cols) - (cols - 1) / 2) * gap,
    y: target.y + (Math.floor(i / cols) - (rows - 1) / 2) * gap,
  }));
}

const NO_GAS = 'Kein Gas: Flugzeuge brauchen Gas als Treibstoff.';

export function move(state: GameState, cmd: MoveCommand): CommandResult {
  const all = ownUnits(state, cmd.player, cmd.unitIds);
  if (all.length === 0) return fail('Keine Einheit ausgewählt.');
  const fuel = hasFuel(state, cmd.player);
  const units = all.filter((u) => fuel || !needsFuel(u));
  if (units.length === 0) return fail(NO_GAS);
  const spots = formation(cmd.target, units.length);
  units.forEach((u, i) => {
    if (u.attacker) delete u.attacker.targetId;
    if (sendTo(state, u, spots[i] ?? cmd.target) && u.mover && cmd.attackMove)
      u.mover.attackMove = true;
  });
  return OK;
}

export function attack(state: GameState, cmd: AttackCommand): CommandResult {
  const target = findEntity(state, cmd.targetId);
  if (!target?.health || target.owner === cmd.player || target.aboard)
    return fail('Kein gültiges Ziel.');
  const fighters = ownUnits(state, cmd.player, cmd.unitIds).filter((u) => u.attacker);
  if (fighters.length === 0) return fail('Diese Einheiten können nicht kämpfen.');
  const able = fighters.filter((u) => canHit(u, target));
  if (able.length === 0) return fail('Diese Einheiten können das nicht treffen.');
  const fuel = hasFuel(state, cmd.player);
  const units = able.filter((u) => fuel || !needsFuel(u));
  if (units.length === 0) return fail(NO_GAS);
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

/** Why this building cannot train this unit (null = it can). */
function trainerProblem(state: GameState, cmd: TrainCommand, b: Entity | undefined): string | null {
  if (!b?.building || b.owner !== cmd.player || b.building.level < 1)
    return 'Gebäude nicht bereit.';
  if (!BUILDINGS[b.building.type].trains?.includes(cmd.unit))
    return 'Kann diese Einheit nicht bauen.';
  const need = UNITS[cmd.unit].requires;
  if (need && !hasResearch(state, cmd.player, need))
    return `Braucht zuerst: ${RESEARCH[need].name}.`;
  return null;
}

export function train(state: GameState, cmd: TrainCommand): CommandResult {
  const b = findEntity(state, cmd.buildingId);
  const problem = trainerProblem(state, cmd, b);
  if (problem || !b) return fail(problem ?? 'Gebäude nicht bereit.');
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
