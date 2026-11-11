import { QUIZ_RULES } from '../content/quiz';
import { MINUTE } from './clock';
import type { Entity } from './entity';
import type { PlayerState } from './state';

/** Knowledge crystals to finish something now: the square root of the minutes left. */
export function speedUpPrice(msLeft: number): number {
  return Math.max(QUIZ_RULES.minPrice, Math.ceil(Math.sqrt(Math.max(0, msLeft) / MINUTE)));
}

/** The timer that a speed-up would end: building work first, then training. */
export function entityTimer(e: Entity): { finishAt: number } | undefined {
  return e.construction ?? e.training;
}

export function researchTimer(player: PlayerState): { finishAt: number } | undefined {
  return player.research.current;
}
