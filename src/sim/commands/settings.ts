import type { Difficulty } from '../../content/ai';
import type { PlayerId } from '../entity';
import type { GameState } from '../state';
import { fail, OK, type CommandResult } from './result';

/** Game options the human player can change in the pause menu. */
export interface SettingsCommand {
  type: 'settings';
  player: PlayerId;
  offlineAttacks?: boolean;
  difficulty?: Difficulty;
}

export function changeSettings(state: GameState, cmd: SettingsCommand): CommandResult {
  if (cmd.player !== 'player') return fail('Nur der Spieler darf die Einstellungen ändern.');
  if (cmd.offlineAttacks !== undefined) state.settings.offlineAttacks = cmd.offlineAttacks;
  if (cmd.difficulty) state.settings.difficulty = cmd.difficulty;
  return OK;
}
