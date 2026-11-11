import type { PlayerId } from '../entity';
import { getPlayer } from '../game';
import { findEntity } from '../spawn';
import { entityTimer, researchTimer, speedUpPrice } from '../speed-up';
import type { GameState } from '../state';
import { pay } from '../wallet';
import { fail, OK, type CommandResult } from './result';

/** Finish building, upgrade, training (entityId) or research now, paid with knowledge crystals. */
export interface SpeedUpCommand {
  type: 'speedUp';
  player: PlayerId;
  entityId?: number;
  research?: boolean;
}

function timerOf(state: GameState, cmd: SpeedUpCommand): { finishAt: number } | undefined {
  if (cmd.research) return researchTimer(getPlayer(state, cmd.player));
  const e = cmd.entityId === undefined ? undefined : findEntity(state, cmd.entityId);
  return e?.owner === cmd.player ? entityTimer(e) : undefined;
}

export function speedUp(state: GameState, cmd: SpeedUpCommand): CommandResult {
  const timer = timerOf(state, cmd);
  const left = timer ? timer.finishAt - state.time : 0;
  if (!timer || left <= 0) return fail('Hier läuft gerade nichts.');
  const price = speedUpPrice(left);
  if (!pay(getPlayer(state, cmd.player), { crystals: price }))
    return fail(`Braucht ${price} Wissenskristalle. Beantwortet Quizfragen!`);
  timer.finishAt = state.time;
  return OK;
}
