import { applyCommand } from '../commands';
import type { Entity, PlayerId, Vec2 } from '../entity';
import { enemyOf } from '../names';
import { distanceTo, isEnemy } from '../systems/targeting';
import type { AiState, GameState, PlayerState } from '../state';
import { homeArmy, launchAttack, tuningOf, waveSize, type AiOptions } from './attack';
import { trainUnit } from './economy';
import { coreOf, housingOf, isFighter, unitsOf } from './queries';
import { militaryPower, sumPower, unitPower } from './strength';

export type { AiOptions } from './attack';

/** Strongest home army the computer may have: a share of the enemy's whole military. */
function armyPowerLimit(state: GameState, player: PlayerState, ai: AiState): number {
  if (ai.free) return Infinity;
  const t = tuningOf(state, ai);
  const enemy = enemyOf(player.id);
  const floor = t.defenders * unitPower('infantry');
  return Math.max(floor, t.armyShare * militaryPower(state, enemy));
}

/** Keeps training soldiers (tanks when there is metal), but not more than allowed. */
function trainArmy(state: GameState, player: PlayerState, ai: AiState): void {
  const t = tuningOf(state, ai);
  const army = homeArmy(state, player);
  if (housingOf(army) >= t.defenders + waveSize(state, ai)) return;
  const room = armyPowerLimit(state, player, ai) - sumPower(army);
  if (room <= 0) return;
  if (room < unitPower('tank') || trainUnit(state, player, 'tank') !== 'acted')
    trainUnit(state, player, 'infantry');
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
