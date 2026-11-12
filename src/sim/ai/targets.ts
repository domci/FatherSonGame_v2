import { AI_TUNING } from '../../content/ai';
import type { SideId } from '../entity';
import { humanSides, isAway } from '../humans';
import { hostile, hostileSides } from '../relations';
import type { AiState, GameState, PlayerState } from '../state';
import { progressOf } from './strength';

export interface AiOptions {
  offline: boolean;
}

/**
 * The side whose level the computer follows (limits for army, fleet and progress):
 * the weakest person it fights (or any person). In balancing runs the player side
 * follows the first computer.
 */
export function rivalOf(state: GameState, owner: SideId): SideId {
  const people = humanSides(state).filter((id) => id !== owner && !state.players[id]?.defeated);
  if (people.length === 0) return hostileSides(state, owner)[0] ?? 'ai';
  const enemies = people.filter((id) => hostile(state, owner, id));
  const list = enemies.length > 0 ? enemies : people;
  return list.reduce((a, b) => (progressOf(state, b) < progressOf(state, a) ? b : a));
}

/** A person who is away (game closed, or online and not connected) only with offline attacks on. */
function canReach(state: GameState, id: SideId, opts: AiOptions): boolean {
  if (isAway(state, id, opts.offline)) return state.settings.offlineAttacks;
  return !opts.offline;
}

/**
 * Sides this computer may attack now: at war with it, and at a similar level.
 * People who are away only with offline attacks on (see canReach).
 */
export function attackable(
  state: GameState,
  player: PlayerState,
  ai: AiState,
  opts: AiOptions,
): PlayerState[] {
  const min = ai.free ? 0 : AI_TUNING[ai.difficulty ?? state.settings.difficulty].minPlayerProgress;
  return hostileSides(state, player.id)
    .filter((id) => canReach(state, id, opts))
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
