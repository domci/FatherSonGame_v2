import type { ResourceAmounts } from '../content/resources';
import type { GameState } from './state';
import { economyStep, tick, TICK_MS, type StepOptions } from './update';

/** Step size when catching up after a long pause. */
const CATCH_UP_STEP_MS = 30_000;
/** Longest fight that is calculated while the game is closed. */
const MAX_BATTLE_MS = 15 * 60_000;
const OFFLINE: StepOptions = { offline: true };

export interface BattleReport {
  lostBuildings: number;
  lostUnits: number;
  defeated: number;
}

export interface CatchUpReport {
  elapsedMs: number;
  gained: ResourceAmounts;
  eventsBefore: number;
  /** Only when there was a fight while the game was closed. */
  battle?: BattleReport;
}

function invaders(state: GameState): number[] {
  const home = state.players.player?.homeBodyId;
  return state.world
    .with('unit')
    .entities.filter((u) => u.owner === 'ai' && u.zone === home && u.attacker)
    .map((u) => u.id);
}

function playerIds(state: GameState, kind: 'building' | 'unit'): Set<number> {
  return new Set(
    state.world
      .with(kind)
      .entities.filter((e) => e.owner === 'player')
      .map((e) => e.id),
  );
}

function lost(state: GameState, before: Set<number>): number {
  let n = 0;
  for (const id of before) if (!state.world.entities.some((e) => e.id === id)) n++;
  return n;
}

function gainedSince(state: GameState, before: ResourceAmounts): ResourceAmounts {
  const gained: ResourceAmounts = {};
  const after = state.players.player?.resources ?? {};
  for (const [id, v] of Object.entries(after) as [keyof ResourceAmounts, number][]) {
    const diff = v - (before[id] ?? 0);
    if (Math.abs(diff) >= 1) gained[id] = diff;
  }
  return gained;
}

/** Calculates what happened while the game was closed. Fights only with offline attacks on. */
export function catchUp(state: GameState, elapsedMs: number): CatchUpReport {
  const before = { ...(state.players.player?.resources ?? {}) };
  const eventsBefore = state.events.length;
  const buildings = playerIds(state, 'building');
  const units = playerIds(state, 'unit');
  const enemies = new Set<number>();
  let left = Math.max(0, elapsedMs);
  let battleMs = 0;
  while (left > 0) {
    const attackers = state.settings.offlineAttacks && !state.winner ? invaders(state) : [];
    if (attackers.length > 0 && battleMs < MAX_BATTLE_MS) {
      attackers.forEach((id) => enemies.add(id));
      tick(state, OFFLINE);
      left -= TICK_MS;
      battleMs += TICK_MS;
      continue;
    }
    const step = Math.min(CATCH_UP_STEP_MS, left);
    economyStep(state, step, OFFLINE);
    left -= step;
  }
  const report: CatchUpReport = { elapsedMs, gained: gainedSince(state, before), eventsBefore };
  if (battleMs > 0)
    report.battle = {
      lostBuildings: lost(state, buildings),
      lostUnits: lost(state, units),
      defeated: lost(state, enemies),
    };
  return report;
}
