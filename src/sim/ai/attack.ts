import { AI_TUNING, type AiTuning } from '../../content/ai';
import { UNITS } from '../../content/units';
import { applyCommand } from '../commands';
import { tell } from '../humans';
import type { Entity, PlayerId } from '../entity';
import type { AiState, GameState, PlayerState } from '../state';
import { housingOf, isFighter, unitsOf } from './queries';
import { homeDefense, powerOf, progressOf, sumPower } from './strength';
import { nextTarget, type AiOptions } from './targets';

/** Biggest attack wave (housing). One transport carries 10. */
const MAX_WAVE = 30;

export type { AiOptions } from './targets';

export function tuningOf(state: GameState, ai: AiState): AiTuning {
  return AI_TUNING[ai.difficulty ?? state.settings.difficulty];
}

/** Housing of the next attack wave. */
export function waveSize(state: GameState, ai: AiState): number {
  const t = tuningOf(state, ai);
  return Math.min(MAX_WAVE, t.firstWave + ai.waves * t.waveGrowth);
}

/** Fighters at home without a job. */
export function homeArmy(state: GameState, player: PlayerState): Entity[] {
  return unitsOf(state, player.id).filter(
    (u) => isFighter(u) && u.zone === player.homeBodyId && u.unit?.type !== 'hunter',
  );
}

/**
 * The strongest wave the computer may send: a share of what defends the enemy home.
 * A rich enemy without defense still counts a little (a quarter of its progress).
 */
export function wavePowerLimit(state: GameState, ai: AiState, enemy: PlayerState): number {
  if (ai.free) return Infinity;
  const defense = Math.max(homeDefense(state, enemy.id), progressOf(state, enemy.id) / 4);
  return tuningOf(state, ai).waveShare * defense;
}

/** Picks the strongest units that fit the wave. The weakest `defenders` stay home. */
export function pickRiders(army: Entity[], keep: number, housing: number, power: number): Entity[] {
  const sorted = [...army].sort((a, b) => powerOf(b) - powerOf(a));
  const free = sorted.slice(0, Math.max(0, sorted.length - keep));
  const riders: Entity[] = [];
  let [h, p] = [0, 0];
  for (const u of free) {
    const [uh, up] = [UNITS[u.unit?.type ?? 'infantry'].housing, powerOf(u)];
    if (h + uh > housing || p + up > power) continue;
    riders.push(u);
    [h, p] = [h + uh, p + up];
  }
  return riders;
}

/** Fills the docked transports with riders and sends them off. Returns the number of ships. */
export function sendShips(
  state: GameState,
  owner: PlayerId,
  riders: Entity[],
  targetId: string,
): number {
  let left = riders;
  let sent = 0;
  for (const ship of unitsOf(state, owner, 'transport')) {
    if (left.length === 0) break;
    if (ship.ship?.phase !== 'docked') continue;
    const ids = left.map((u) => u.id);
    if (!applyCommand(state, { type: 'board', player: owner, shipId: ship.id, unitIds: ids }).ok)
      continue;
    left = left.filter((u) => !u.aboard);
    applyCommand(state, { type: 'fly', player: owner, shipId: ship.id, targetId });
    sent += 1;
  }
  return sent;
}

export function launchAttack(
  state: GameState,
  player: PlayerState,
  ai: AiState,
  opts: AiOptions,
): void {
  if (state.time < ai.nextAttackAt) return;
  const enemy = nextTarget(state, player, ai, opts);
  if (!enemy) return;
  const t = tuningOf(state, ai);
  const size = waveSize(state, ai);
  const limit = wavePowerLimit(state, ai, enemy);
  const riders = pickRiders(homeArmy(state, player), t.defenders, size, limit);
  const full = housingOf(riders) >= size || sumPower(riders) >= 0.7 * limit;
  if (!full || housingOf(riders) < 2) return;
  if (sendShips(state, player.id, riders, enemy.homeBodyId) === 0) return;
  ai.waves += 1;
  ai.nextAttackAt = state.time + t.attackEveryMs;
  tell(state, enemy.id, 'Achtung: Ein feindliches Schiff fliegt zu euch!', 'bad');
}
