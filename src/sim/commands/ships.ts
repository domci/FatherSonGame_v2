import type { PlayerId } from '../entity';
import { BELT_ID, findBody } from '../generation/solar-system';
import { findEntity } from '../spawn';
import type { GameState } from '../state';
import { launchShip } from '../systems/mining';
import { fail, OK, type CommandResult } from './result';
import { L } from '../../content/text';

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
  if (!ship?.ship || ship.owner !== cmd.player)
    return fail(L('Schiff nicht gefunden.', 'Ship not found.'));
  if (ship.unit?.type === 'transport')
    return fail(L('Das ist kein Mining-Schiff.', 'That is not a mining ship.'));
  if (ship.ship.phase !== 'docked')
    return fail(L('Das Schiff ist unterwegs.', 'The ship is on its way.'));
  const home = state.players[cmd.player]?.homeBodyId;
  if (cmd.targetId === home)
    return fail(L('Das ist euer Heimatplanet.', 'That is your home planet.'));
  if (cmd.targetId !== BELT_ID && !findBody(state.system, cmd.targetId))
    return fail(L('Ziel unbekannt.', 'Unknown target.'));
  launchShip(state, ship, cmd.targetId);
  return OK;
}

export function recallShip(state: GameState, cmd: RecallShipCommand): CommandResult {
  const ship = findEntity(state, cmd.shipId);
  if (!ship?.ship || ship.owner !== cmd.player)
    return fail(L('Schiff nicht gefunden.', 'Ship not found.'));
  ship.ship.repeat = false;
  return OK;
}
