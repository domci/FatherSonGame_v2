import { applyCommand } from '../commands';
import type { Entity, PlayerId } from '../entity';
import { weaponHits } from '../layers';
import { enemyOf } from '../names';
import { hasResearch } from '../research-helpers';
import { blockers, shipsAt, warships } from '../space/places';
import type { AiState, GameState, PlayerState } from '../state';
import { tuningOf, type AiOptions } from './attack';
import { trainUnit } from './economy';
import { buildingsOf, unitCount } from './queries';
import { progressOf, sumPower, unitPower } from './strength';

/** Never more war ships than this (keeps long games fast). */
const MAX_SHIPS = 12;
/** A fleet attacks only when it is this much stronger than what waits there. */
const ADVANTAGE = 1.3;
/** Below this share of its life, the fleet flies home. */
const RETREAT_AT = 0.4;

export function fleetOf(state: GameState, owner: PlayerId): Entity[] {
  return warships(state).filter((e) => e.owner === owner);
}

/** War ships and orbital cannons that defend a place. */
export function defenseAt(state: GameState, owner: PlayerId, place: string): number {
  const cannons = buildingsOf(state, owner).filter(
    (b) => b.zone === place && weaponHits(b) === 'space',
  );
  return sumPower(shipsAt(state, place, owner)) + sumPower(cannons);
}

function lifeShare(ships: Entity[]): number {
  const hp = ships.reduce((s, e) => s + (e.health?.hp ?? 0), 0);
  const max = ships.reduce((s, e) => s + (e.health?.max ?? 0), 0);
  return max ? hp / max : 0;
}

/** The fleet may be at most a share of the enemy's fleet and orbital cannons. */
function fleetLimit(state: GameState, player: PlayerState, ai: AiState): number {
  if (ai.free) return Infinity;
  const enemy = enemyOf(player.id);
  const cannons = buildingsOf(state, enemy).filter((b) => weaponHits(b) === 'space');
  const theirs = sumPower(fleetOf(state, enemy)) + sumPower(cannons);
  return Math.max(2 * unitPower('spaceFighter'), tuningOf(state, ai).armyShare * theirs);
}

export function trainFleet(state: GameState, player: PlayerState, ai: AiState): void {
  if (!hasResearch(state, player.id, 'warships')) return;
  const ships = fleetOf(state, player.id);
  const planned =
    unitCount(state, player.id, 'spaceFighter') + unitCount(state, player.id, 'cruiser');
  if (planned >= MAX_SHIPS) return;
  const room = fleetLimit(state, player, ai) - sumPower(ships);
  if (room <= 0) return;
  if (room < unitPower('cruiser') || trainUnit(state, player, 'cruiser') !== 'acted')
    trainUnit(state, player, 'spaceFighter');
}

/** Same rules as the ground attacks: not too early, only against an enemy at a similar level. */
function mayRaid(state: GameState, ai: AiState, enemy: PlayerState, opts: AiOptions): boolean {
  if (opts.offline && !state.settings.offlineAttacks) return false;
  if (ai.waves === 0 && state.time < ai.nextAttackAt) return false;
  return !!ai.free || progressOf(state, enemy.id) >= tuningOf(state, ai).minPlayerProgress;
}

/** Where the enemy's mining ships work most. */
function enemyMining(state: GameState, enemy: PlayerId): string | undefined {
  const count = new Map<string, number>();
  for (const m of state.world.with('ship')) {
    const t = m.ship.targetBodyId;
    if (m.owner === enemy && t && m.unit?.type === 'miningShip')
      count.set(t, (count.get(t) ?? 0) + 1);
  }
  return [...count].sort((a, b) => b[1] - a[1])[0]?.[0];
}

/** A place where own mining ships work and the enemy blocks them. */
function blockedMining(state: GameState, owner: PlayerId): string | undefined {
  return state.world
    .with('ship')
    .entities.map((m) => (m.owner === owner ? m.ship.targetBodyId : undefined))
    .find((t) => !!t && blockers(state, owner, t).length > 0);
}

/** Attack goal: the enemy home from orbit (with the Orbitallaser), else block its mining. */
function raidGoal(state: GameState, player: PlayerState, enemy: PlayerState): string | undefined {
  const power = sumPower(fleetOf(state, player.id));
  const strong = (place: string): boolean => power >= ADVANTAGE * defenseAt(state, enemy.id, place);
  if (hasResearch(state, player.id, 'orbitalLaser') && strong(enemy.homeBodyId))
    return enemy.homeBodyId;
  const mining = enemyMining(state, enemy.id);
  return mining && strong(mining) ? mining : undefined;
}

function goal(state: GameState, player: PlayerState, ai: AiState, opts: AiOptions): string {
  const home = player.homeBodyId;
  const ships = fleetOf(state, player.id);
  const enemy = state.players[enemyOf(player.id)];
  if (!enemy || lifeShare(ships) < RETREAT_AT || blockers(state, player.id, home).length)
    return home;
  const blocked = blockedMining(state, player.id);
  if (blocked && sumPower(ships) >= ADVANTAGE * defenseAt(state, enemy.id, blocked)) return blocked;
  if (ships.length < 2 || !mayRaid(state, ai, enemy, opts)) return home;
  return raidGoal(state, player, enemy) ?? home;
}

/** The fleet waits at home, breaks blockades, blocks the enemy's mining or attacks from orbit. */
export function moveFleet(
  state: GameState,
  player: PlayerState,
  ai: AiState,
  opts: AiOptions,
): void {
  const ships = fleetOf(state, player.id);
  if (ships.length === 0 || ships.some((s) => s.orbit?.to)) return;
  const target = goal(state, player, ai, opts);
  if (ships.some((s) => s.orbit?.at !== target))
    applyCommand(state, { type: 'fleet', player: player.id, targetId: target });
}
