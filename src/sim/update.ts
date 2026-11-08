import { constructionSystem, trainingSystem } from './systems/construction';
import { combatSystem } from './systems/combat';
import { miningSystem } from './systems/mining';
import { movementSystem } from './systems/movement';
import { productionSystem } from './systems/production';
import { researchSystem } from './systems/research';
import { eggSystem, spiderSystem } from './systems/spiders';
import type { GameState } from './state';
import type { ResourceAmounts } from '../content/resources';

/** One live step = 100 ms of game time. */
export const TICK_MS = 100;
/** Step size when catching up after a long pause. */
const CATCH_UP_STEP_MS = 30_000;

/** Things that follow the clock (timers, production). Also used offline. */
export function economyStep(state: GameState, dtMs: number): void {
  state.time += dtMs;
  constructionSystem(state);
  trainingSystem(state);
  researchSystem(state);
  productionSystem(state, dtMs);
  miningSystem(state);
  eggSystem(state);
}

/** Things that only happen while someone watches (movement, fights). */
export function liveStep(state: GameState, dtMs: number): void {
  movementSystem(state, dtMs);
  spiderSystem(state);
  combatSystem(state);
}

export function tick(state: GameState): void {
  economyStep(state, TICK_MS);
  liveStep(state, TICK_MS);
}

export interface CatchUpReport {
  elapsedMs: number;
  gained: ResourceAmounts;
  eventsBefore: number;
}

/** Calculates what happened while the game was closed. */
export function catchUp(state: GameState, elapsedMs: number): CatchUpReport {
  const before = { ...(state.players.player?.resources ?? {}) };
  const eventsBefore = state.events.length;
  let left = Math.max(0, elapsedMs);
  while (left > 0) {
    const step = Math.min(CATCH_UP_STEP_MS, left);
    economyStep(state, step);
    left -= step;
  }
  const after = state.players.player?.resources ?? {};
  const gained: ResourceAmounts = {};
  for (const [id, v] of Object.entries(after) as [keyof ResourceAmounts, number][]) {
    const diff = v - (before[id] ?? 0);
    if (Math.abs(diff) >= 1) gained[id] = diff;
  }
  return { elapsedMs, gained, eventsBefore };
}
