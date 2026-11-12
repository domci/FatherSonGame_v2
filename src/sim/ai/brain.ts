import { SECOND } from '../clock';
import type { PlayerId } from '../entity';
import type { GameState } from '../state';
import type { AiState } from '../state';
import { tuningOf } from './attack';
import { runEconomy } from './economy';
import { runMilitary, type AiOptions } from './military';
import { sendMiners } from './miners';
import { progressOf } from './strength';
import { rivalOf } from './targets';
import { runDiplomacy } from './diplomacy';
import { isSide } from '../relations';

export const THINK_MS = 5 * SECOND;

/** The computer stays near the level of the player: when it is ahead, it waits. */
export function isAhead(state: GameState, owner: PlayerId, ai: AiState): boolean {
  if (ai.free || !isSide(owner)) return false;
  const t = tuningOf(state, ai);
  const rival = progressOf(state, rivalOf(state, owner));
  return progressOf(state, owner) >= t.lead * rival + t.leadBonus;
}

/** The computer players think every few seconds. Uses only commands, like a human. */
export function aiSystem(state: GameState, opts: AiOptions): void {
  if (state.winner) return;
  for (const [id, ai] of Object.entries(state.ai) as [
    PlayerId,
    NonNullable<GameState['ai'][PlayerId]>,
  ][]) {
    const player = state.players[id];
    if (!player || player.defeated || ai.nextThinkAt > state.time) continue;
    ai.nextThinkAt = state.time + (ai.thinkMs ?? THINK_MS);
    if (!opts.offline) runDiplomacy(state, player, ai);
    runMilitary(state, player, ai, opts);
    runEconomy(state, id, 2, isAhead(state, id, ai));
    sendMiners(state, id);
  }
}
