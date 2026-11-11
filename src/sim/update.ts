import { aiSystem } from './ai/brain';
import { constructionSystem, trainingSystem } from './systems/construction';
import { colonySystem } from './systems/colony';
import { combatSystem } from './systems/combat';
import { defenseSystem } from './systems/defense';
import { guardSystem } from './systems/guard';
import { miningSystem } from './systems/mining';
import { movementSystem } from './systems/movement';
import { productionSystem } from './systems/production';
import { researchSystem } from './systems/research';
import { fleetSystem } from './systems/fleet';
import { fuelSystem } from './systems/fuel';
import { orbitStrikeSystem } from './systems/orbit-strike';
import { spaceCombatSystem } from './systems/space-combat';
import { eggSystem, spiderSystem } from './systems/spiders';
import { transportSystem } from './systems/transport';
import { visibilitySystem } from './visibility';
import type { GameState } from './state';

/** One live step = 100 ms of game time. */
export const TICK_MS = 100;

export interface StepOptions {
  /** true while catching up after the game was closed. */
  offline: boolean;
}

const LIVE: StepOptions = { offline: false };

/** Things that follow the clock (timers, production, the computer's plans). Also used offline. */
export function economyStep(state: GameState, dtMs: number, opts: StepOptions = LIVE): void {
  state.time += dtMs;
  constructionSystem(state);
  trainingSystem(state);
  researchSystem(state);
  productionSystem(state, dtMs);
  colonySystem(state, dtMs);
  fleetSystem(state);
  miningSystem(state, opts);
  transportSystem(state, opts);
  defenseSystem(state, dtMs);
  eggSystem(state);
  aiSystem(state, opts);
}

/** Things that only happen while someone watches (movement, fights). */
export function liveStep(state: GameState, dtMs: number): void {
  movementSystem(state, dtMs);
  spiderSystem(state);
  guardSystem(state, dtMs);
  combatSystem(state);
  spaceCombatSystem(state);
  orbitStrikeSystem(state);
  fuelSystem(state, dtMs);
  visibilitySystem(state);
}

export function tick(state: GameState, opts: StepOptions = LIVE): void {
  economyStep(state, TICK_MS, opts);
  liveStep(state, TICK_MS);
}

export { catchUp, type CatchUpReport } from './catch-up';
