import { AI_TUNING } from '../../content/ai';
import type { SideId } from '../entity';
import { hostileSides } from '../relations';
import type { AiState, GameState, PlayerState } from '../state';
import { progressOf } from './strength';

export interface AiOptions {
  offline: boolean;
}

/**
 * The side whose level the computer follows (limits for army, fleet and progress):
 * the human player. In balancing runs the player side follows the first computer.
 */
export function rivalOf(state: GameState, owner: SideId): SideId {
  if (owner !== 'player') return 'player';
  return hostileSides(state, owner)[0] ?? 'ai';
}

/**
 * Sides this computer may attack now: at war with it, and at a similar level.
 * While the game is closed, only the player (and only with offline attacks on).
 */
export function attackable(
  state: GameState,
  player: PlayerState,
  ai: AiState,
  opts: AiOptions,
): PlayerState[] {
  const min = ai.free ? 0 : AI_TUNING[ai.difficulty ?? state.settings.difficulty].minPlayerProgress;
  return hostileSides(state, player.id)
    .filter((id) => !opts.offline || (id === 'player' && state.settings.offlineAttacks))
    .map((id) => state.players[id])
    .filter((p): p is PlayerState => !!p && progressOf(state, p.id) >= min);
}

/** The next target: the enemies take turns, one wave each (so nobody gets all attacks). */
export function nextTarget(
  state: GameState,
  player: PlayerState,
  ai: AiState,
  opts: AiOptions,
): PlayerState | undefined {
  const list = attackable(state, player, ai, opts);
  return list[ai.waves % Math.max(1, list.length)];
}
