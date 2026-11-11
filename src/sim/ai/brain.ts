import { SECOND } from '../clock';
import type { PlayerId } from '../entity';
import type { GameState } from '../state';
import { enemyOf } from '../names';
import type { AiState } from '../state';
import { tuningOf } from './attack';
import { runEconomy } from './economy';
import { runMilitary, type AiOptions } from './military';
import { sendMiners } from './miners';
import { progressOf } from './strength';

export const THINK_MS = 5 * SECOND;

/** The computer stays near the level of its enemy: when it is ahead, it waits. */
export function isAhead(state: GameState, owner: PlayerId, ai: AiState): boolean {
  if (ai.free) return false;
  const t = tuningOf(state, ai);
  return progressOf(state, owner) >= t.lead * progressOf(state, enemyOf(owner)) + t.leadBonus;
}

/** The computer players think every few seconds. Uses only commands, like a human. */
export function aiSystem(state: GameState, opts: AiOptions): void {
  if (state.winner) return;
  for (const [id, ai] of Object.entries(state.ai) as [
    PlayerId,
    NonNullable<GameState['ai'][PlayerId]>,
  ][]) {
    const player = state.players[id];
    if (!player || ai.nextThinkAt > state.time) continue;
    ai.nextThinkAt = state.time + (ai.thinkMs ?? THINK_MS);
    runMilitary(state, player, ai, opts);
    runEconomy(state, id, 2, isAhead(state, id, ai));
    sendMiners(state, id);
  }
}
