import { UNITS } from '../../content/units';
import type { Entity, PlayerId } from '../entity';
import { findEntity } from '../spawn';
import type { GameState } from '../state';
import { flightMs, passengers, unloadShip } from '../transport';
import { fail, OK, type CommandResult } from './result';

export interface BoardCommand {
  type: 'board';
  player: PlayerId;
  shipId: number;
  unitIds: number[];
}

export interface UnloadCommand {
  type: 'unload';
  player: PlayerId;
  shipId: number;
}

export interface FlyCommand {
  type: 'fly';
  player: PlayerId;
  shipId: number;
  /** Planet id. */
  targetId: string;
}

function readyTransport(state: GameState, player: PlayerId, shipId: number): Entity | string {
  const ship = findEntity(state, shipId);
  if (!ship?.ship || ship.unit?.type !== 'transport' || ship.owner !== player)
    return 'Transportschiff nicht gefunden.';
  if (ship.ship.phase !== 'docked' && ship.ship.phase !== 'landed')
    return 'Das Schiff fliegt gerade.';
  return ship;
}

export function spaceLeft(state: GameState, ship: Entity): number {
  const used = passengers(state, ship.id).reduce(
    (s, u) => s + (u.unit ? UNITS[u.unit.type].housing : 0),
    0,
  );
  return (UNITS.transport.carries ?? 0) - used;
}

/** Can this unit go into this ship? */
function canBoard(u: Entity | undefined, ship: Entity, player: PlayerId): u is Entity {
  if (!u?.unit || u.owner !== player || u.zone !== ship.zone) return false;
  const def = UNITS[u.unit.type];
  return !u.ship && !u.busyWith && !u.aboard && !def.space && (!def.flying || !!def.air);
}

export function board(state: GameState, cmd: BoardCommand): CommandResult {
  const ship = readyTransport(state, cmd.player, cmd.shipId);
  if (typeof ship === 'string') return fail(ship);
  let left = spaceLeft(state, ship);
  let count = 0;
  for (const id of cmd.unitIds) {
    const u = findEntity(state, id);
    if (!canBoard(u, ship, cmd.player) || !u.unit) continue;
    const need = UNITS[u.unit.type].housing;
    if (need > left) continue;
    left -= need;
    count++;
    if (u.mover) state.world.removeComponent(u, 'mover');
    if (u.attacker) delete u.attacker.targetId;
    u.zone = 'space';
    state.world.addComponent(u, 'aboard', { shipId: ship.id });
  }
  return count > 0 ? OK : fail('Keine passende Einheit oder kein Platz mehr.');
}

export function unload(state: GameState, cmd: UnloadCommand): CommandResult {
  const ship = readyTransport(state, cmd.player, cmd.shipId);
  if (typeof ship === 'string') return fail(ship);
  return unloadShip(state, ship) > 0 ? OK : fail('Das Schiff ist leer.');
}

export function fly(state: GameState, cmd: FlyCommand): CommandResult {
  const ship = readyTransport(state, cmd.player, cmd.shipId);
  if (typeof ship === 'string') return fail(ship);
  if (!ship.ship || !ship.zone) return fail('Schiff nicht bereit.');
  if (!state.surfaces[cmd.targetId]) return fail('Dort kann man nicht landen.');
  if (cmd.targetId === ship.zone) return fail('Das Schiff ist schon dort.');
  ship.ship.fromBodyId = ship.zone;
  ship.ship.targetBodyId = cmd.targetId;
  ship.ship.phase = 'outbound';
  ship.ship.phaseStartAt = state.time;
  ship.ship.phaseEndsAt = state.time + flightMs(state, ship.zone, cmd.targetId);
  return OK;
}
