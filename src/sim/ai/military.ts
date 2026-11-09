import { AI_TUNING, type AiTuning } from '../../content/ai';
import { applyCommand } from '../commands';
import { addEvent } from '../game';
import type { Entity, PlayerId, Vec2 } from '../entity';
import { enemyOf } from '../names';
import { distanceTo, isEnemy } from '../systems/targeting';
import type { AiState, GameState, PlayerState } from '../state';
import { trainUnit } from './economy';
import { coreOf, housingOf, isFighter, unitsOf } from './queries';

/** Biggest attack wave (housing). One transport carries 10. */
const MAX_WAVE = 30;

export interface AiOptions {
  offline: boolean;
}

function tuningOf(state: GameState, ai: AiState): AiTuning {
  return AI_TUNING[ai.difficulty ?? state.settings.difficulty];
}

function waveSize(state: GameState, ai: AiState): number {
  const t = tuningOf(state, ai);
  return Math.min(MAX_WAVE, t.firstWave + ai.waves * t.waveGrowth);
}

/** Fighters at home without a job. */
function homeArmy(state: GameState, player: PlayerState): Entity[] {
  return unitsOf(state, player.id).filter(
    (u) => isFighter(u) && u.zone === player.homeBodyId && u.unit?.type !== 'hunter',
  );
}

/** Keeps training soldiers (tanks when there is metal). */
function trainArmy(state: GameState, player: PlayerState, ai: AiState): void {
  const t = tuningOf(state, ai);
  const want = t.defenders + waveSize(state, ai);
  if (housingOf(homeArmy(state, player)) >= want) return;
  if (trainUnit(state, player, 'tank') !== 'acted') trainUnit(state, player, 'infantry');
}

function attackMove(state: GameState, owner: PlayerId, units: Entity[], target: Vec2): void {
  const ids = units.filter((u) => !u.attacker?.targetId && !u.mover).map((u) => u.id);
  if (ids.length)
    applyCommand(state, { type: 'move', player: owner, unitIds: ids, target, attackMove: true });
}

/** Sends the home army against intruders near the base. */
function defend(state: GameState, player: PlayerState): void {
  const core = coreOf(state, player.id);
  if (!core?.position) return;
  const intruder = state.world
    .with('health', 'position')
    .entities.find(
      (e) => e.unit && isEnemy(core, e) && distanceTo(core.position ?? e.position, e) < 16,
    );
  if (intruder) attackMove(state, player.id, homeArmy(state, player), intruder.position);
}

/** Units on the enemy planet march to the enemy base. Empty ships fly home. */
function front(state: GameState, player: PlayerState): void {
  const enemy = state.players[enemyOf(player.id)];
  const target = enemy && coreOf(state, enemy.id)?.position;
  if (!enemy || !target) return;
  const away = unitsOf(state, player.id).filter((u) => u.zone === enemy.homeBodyId);
  attackMove(state, player.id, away.filter(isFighter), target);
  for (const ship of away.filter((u) => u.ship?.phase === 'landed'))
    applyCommand(state, {
      type: 'fly',
      player: player.id,
      shipId: ship.id,
      targetId: player.homeBodyId,
    });
}

/** Fills the docked transports with riders and sends them off. Returns the number of ships. */
function sendShips(state: GameState, owner: PlayerId, riders: Entity[], targetId: string): number {
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

function launchAttack(state: GameState, player: PlayerState, ai: AiState, opts: AiOptions): void {
  if (state.time < ai.nextAttackAt || (opts.offline && !state.settings.offlineAttacks)) return;
  const enemy = state.players[enemyOf(player.id)];
  if (!enemy) return;
  const t = tuningOf(state, ai);
  const army = homeArmy(state, player).sort((a, b) => (b.health?.max ?? 0) - (a.health?.max ?? 0));
  if (housingOf(army) < t.defenders + waveSize(state, ai)) return;
  const riders = army.slice(0, Math.max(1, army.length - t.defenders));
  if (sendShips(state, player.id, riders, enemy.homeBodyId) === 0) return;
  ai.waves += 1;
  ai.nextAttackAt = state.time + t.attackEveryMs;
  if (enemy.id === 'player')
    addEvent(state, 'Achtung: Ein feindliches Schiff fliegt zu euch!', 'bad');
}

export function runMilitary(
  state: GameState,
  player: PlayerState,
  ai: AiState,
  opts: AiOptions,
): void {
  trainArmy(state, player, ai);
  defend(state, player);
  front(state, player);
  launchAttack(state, player, ai, opts);
}
