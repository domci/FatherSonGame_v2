import { applyCommand } from '../commands';
import type { Entity, PlayerId, Vec2 } from '../entity';
import { hostileSides } from '../relations';
import { distanceTo, isEnemy } from '../systems/targeting';
import type { AiState, GameState, PlayerState } from '../state';
import { homeArmy, launchAttack, pickRiders, tuningOf, waveSize, type AiOptions } from './attack';
import { trainUnit } from './economy';
import { coreOf, housingOf, isFighter, unitsOf } from './queries';
import { militaryPower, sumPower, unitPower } from './strength';
import { moveFleet, trainFleet } from './fleet';
import { rivalOf } from './targets';
import { layerOf } from '../layers';
import type { UnitId } from '../../content/units';

export type { AiOptions } from './attack';

/** Strongest home army the computer may have: a share of the player's whole military. */
function armyPowerLimit(state: GameState, player: PlayerState, ai: AiState): number {
  if (ai.free) return Infinity;
  const t = tuningOf(state, ai);
  const enemy = rivalOf(state, player.id);
  const floor = t.defenders * unitPower('infantry');
  return Math.max(floor, t.armyShare * militaryPower(state, enemy));
}

function enemyAir(state: GameState, owner: PlayerId): number {
  return hostileSides(state, owner).reduce(
    (n, id) => n + unitsOf(state, id).filter((u) => layerOf(u) === 'air').length,
    0,
  );
}

/** What the army needs next: flak against enemy planes, some planes, tanks, soldiers. */
function wishList(state: GameState, player: PlayerState, army: Entity[], room: number): UnitId[] {
  const flak = army.filter((u) => u.unit?.type === 'flakTank').length;
  const out: UnitId[] = [];
  if (enemyAir(state, player.id) > 2 * flak) out.push('flakTank');
  const air = housingOf(army.filter((u) => layerOf(u) === 'air'));
  if (air * 3 < housingOf(army)) out.push(room >= unitPower('bomber') ? 'bomber' : 'fighter');
  if (room >= unitPower('tank')) out.push('tank');
  out.push('infantry');
  return out;
}

/**
 * Keeps training an army until a full wave is ready next to the defenders, but not more
 * than allowed. (Counting riders like the attack does: big units may not fit the wave.)
 */
function trainArmy(state: GameState, player: PlayerState, ai: AiState): void {
  const t = tuningOf(state, ai);
  const army = homeArmy(state, player);
  const size = waveSize(state, ai);
  if (housingOf(pickRiders(army, t.defenders, size, Infinity)) >= size) return;
  const room = armyPowerLimit(state, player, ai) - sumPower(army);
  if (room <= 0) return;
  for (const unit of wishList(state, player, army, room))
    if (trainUnit(state, player, unit) === 'acted') return;
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
      (e) => e.unit && isEnemy(state, core, e) && distanceTo(core.position ?? e.position, e) < 16,
    );
  if (intruder) attackMove(state, player.id, homeArmy(state, player), intruder.position);
}

/** Units on an enemy planet march to that enemy's base. Empty ships fly home. */
function front(state: GameState, player: PlayerState): void {
  for (const id of hostileSides(state, player.id)) {
    const enemy = state.players[id];
    const target = enemy && coreOf(state, id)?.position;
    if (!enemy || !target) continue;
    const away = unitsOf(state, player.id).filter((u) => u.zone === enemy.homeBodyId);
    attackMove(state, player.id, away.filter(isFighter), target);
  }
  const landed = unitsOf(state, player.id).filter(
    (u) => u.ship?.phase === 'landed' && u.zone !== player.homeBodyId,
  );
  for (const ship of landed)
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
  trainFleet(state, player, ai);
  defend(state, player);
  front(state, player);
  launchAttack(state, player, ai, opts);
  moveFleet(state, player, ai, opts);
}
