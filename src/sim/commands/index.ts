import type { GameState } from '../state';
import { build, upgrade, type BuildCommand, type UpgradeCommand } from './build';
import { fleet, type FleetCommand } from './fleet';
import { research, type ResearchCommand } from './research';
import { fail, type CommandResult } from './result';
import { recallShip, sendShip, type RecallShipCommand, type SendShipCommand } from './ships';
import { changeSettings, type SettingsCommand } from './settings';
import { quizAnswer, quizAsk, type QuizAnswerCommand, type QuizAskCommand } from './quiz';
import { speedUp, type SpeedUpCommand } from './speed-up';
import {
  board,
  fly,
  unload,
  type BoardCommand,
  type FlyCommand,
  type UnloadCommand,
} from './transport';
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
  | RecallShipCommand
  | BoardCommand
  | UnloadCommand
  | FlyCommand
  | FleetCommand
  | SettingsCommand
  | QuizAskCommand
  | QuizAnswerCommand
  | SpeedUpCommand;

export type { CommandResult };

type Handlers = {
  [K in Command['type']]: (state: GameState, cmd: Extract<Command, { type: K }>) => CommandResult;
};

const HANDLERS: Handlers = {
  build,
  upgrade,
  move,
  attack,
  train,
  research,
  sendShip,
  recallShip,
  board,
  unload,
  fly,
  fleet,
  settings: changeSettings,
  quizAsk,
  quizAnswer,
  speedUp,
};

export function applyCommand(state: GameState, cmd: Command): CommandResult {
  if (!state.players[cmd.player]) return fail('Unbekannter Spieler.');
  if (state.winner) return fail('Das Spiel ist vorbei.');
  const handler = HANDLERS[cmd.type] as (s: GameState, c: Command) => CommandResult;
  return handler(state, cmd);
}
