import type { PlayerId } from '../entity';
import { BELT_ID, findBody } from '../generation/solar-system';
import { findEntity } from '../spawn';
import type { GameState } from '../state';
import { launchShip } from '../systems/mining';
import { fail, OK, type CommandResult } from './result';

export interface SendShipCommand {
  type: 'sendShip';
  player: PlayerId;
  shipId: number;
  /** A planet id or 'belt' for the asteroid belt. */
  targetId: string;
}

export interface RecallShipCommand {
  type: 'recallShip';
  player: PlayerId;
  shipId: number;
}

export function sendShip(state: GameState, cmd: SendShipCommand): CommandResult {
  const ship = findEntity(state, cmd.shipId);
  if (!ship?.ship || ship.owner !== cmd.player) return fail('Schiff nicht gefunden.');
  if (ship.ship.phase !== 'docked') return fail('Das Schiff ist unterwegs.');
  const home = state.players[cmd.player]?.homeBodyId;
  if (cmd.targetId === home) return fail('Das ist euer Heimatplanet.');
  if (cmd.targetId !== BELT_ID && !findBody(state.system, cmd.targetId))
    return fail('Ziel unbekannt.');
  launchShip(state, ship, cmd.targetId);
  return OK;
}

export function recallShip(state: GameState, cmd: RecallShipCommand): CommandResult {
  const ship = findEntity(state, cmd.shipId);
  if (!ship?.ship || ship.owner !== cmd.player) return fail('Schiff nicht gefunden.');
  ship.ship.repeat = false;
  return OK;
}
