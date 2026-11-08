import type { GameState } from '../state';
import { build, upgrade, type BuildCommand, type UpgradeCommand } from './build';
import { research, type ResearchCommand } from './research';
import { fail, type CommandResult } from './result';
import { recallShip, sendShip, type RecallShipCommand, type SendShipCommand } from './ships';
import {
  attack,
  move,
  train,
  type AttackCommand,
  type MoveCommand,
  type TrainCommand,
} from './units';

/** Every action of a player (or the AI) is one of these. Later they can go over the network. */
export type Command =
  | BuildCommand
  | UpgradeCommand
  | MoveCommand
  | AttackCommand
  | TrainCommand
  | ResearchCommand
  | SendShipCommand
  | RecallShipCommand;

export type { CommandResult };

export function applyCommand(state: GameState, cmd: Command): CommandResult {
  if (!state.players[cmd.player]) return fail('Unbekannter Spieler.');
  switch (cmd.type) {
    case 'build':
      return build(state, cmd);
    case 'upgrade':
      return upgrade(state, cmd);
    case 'move':
      return move(state, cmd);
    case 'attack':
      return attack(state, cmd);
    case 'train':
      return train(state, cmd);
    case 'research':
      return research(state, cmd);
    case 'sendShip':
      return sendShip(state, cmd);
    case 'recallShip':
      return recallShip(state, cmd);
  }
}
