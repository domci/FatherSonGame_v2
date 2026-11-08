import { BUILDINGS } from '../../content/buildings';
import { EGG_FOOD, SPIDER_FOOD } from '../../content/units';
import { sendTo } from '../commands/units';
import { addEvent } from '../game';
import type { Entity } from '../entity';
import { findEntity } from '../spawn';
import { playerStats } from '../stats';
import type { GameState } from '../state';
import { addResources } from '../wallet';

const AGGRO_RANGE = 5;

/** Distance from a point to the edge of a target (buildings are big). */
export function distanceTo(from: { x: number; y: number }, target: Entity): number {
  if (!target.position) return Infinity;
  const d = Math.hypot(target.position.x - from.x, target.position.y - from.y);
  const radius = target.building ? BUILDINGS[target.building.type].size / 2 : 0;
  return Math.max(0, d - radius);
}

function isEnemy(a: Entity, b: Entity): boolean {
  return !!a.owner && !!b.owner && a.owner !== b.owner && !!b.health && a.zone === b.zone;
}

function nearestEnemy(state: GameState, unit: Entity): Entity | undefined {
  if (!unit.position) return undefined;
  let best: Entity | undefined;
  let bestDist = AGGRO_RANGE;
  for (const other of state.world.with('health', 'position')) {
    if (!isEnemy(unit, other) || other.egg || other.nest) continue;
    const d = distanceTo(unit.position, other);
    if (d < bestDist) [best, bestDist] = [other, d];
  }
  return best;
}

function reward(state: GameState, dead: Entity, killer: Entity): void {
  const food = dead.egg ? EGG_FOOD : dead.unit?.type === 'spider' ? SPIDER_FOOD : 0;
  const player = killer.owner ? state.players[killer.owner] : undefined;
  if (!food || !player) return;
  addResources(player, { food }, playerStats(state, player.id).storage);
  if (player.id === 'player')
    addEvent(state, `+${food} Nahrung (${dead.egg ? 'Ei' : 'Spinne'}).`, 'good');
}

function killed(state: GameState, dead: Entity, killer: Entity): void {
  reward(state, dead, killer);
  if (dead.construction) {
    const drone = findEntity(state, dead.construction.droneId);
    if (drone?.busyWith) state.world.removeComponent(drone, 'busyWith');
  }
  if (dead.owner === 'player' && dead.building) {
    addEvent(state, `${BUILDINGS[dead.building.type].name} wurde zerstört!`, 'bad');
  }
  state.world.remove(dead);
}

function strike(state: GameState, unit: Entity, target: Entity): void {
  if (!unit.attacker || !target.health) return;
  target.health.hp -= unit.attacker.damage;
  unit.attacker.readyAt = state.time + unit.attacker.cooldownMs;
  if (target.health.hp <= 0) {
    killed(state, target, unit);
    delete unit.attacker.targetId;
  }
}

function chase(state: GameState, unit: Entity, target: Entity): void {
  const path = unit.mover?.path;
  const goal = path?.[path.length - 1];
  const tp = target.position;
  if (!tp || (goal && Math.hypot(goal.x - tp.x, goal.y - tp.y) < 1)) return;
  if (!sendTo(state, unit, tp) && unit.attacker) delete unit.attacker.targetId;
}

function currentTarget(state: GameState, unit: Entity): Entity | undefined {
  if (!unit.attacker) return undefined;
  if (unit.attacker.targetId === undefined && !unit.mover && unit.owner !== 'wild') {
    unit.attacker.targetId = nearestEnemy(state, unit)?.id;
  }
  if (unit.attacker.targetId === undefined) return undefined;
  const target = findEntity(state, unit.attacker.targetId);
  if (target?.health && target.zone === unit.zone) return target;
  delete unit.attacker.targetId;
  return undefined;
}

function fight(state: GameState, unit: Entity): void {
  if (!unit.attacker || !unit.position) return;
  const target = currentTarget(state, unit);
  if (!target) return;
  if (distanceTo(unit.position, target) > unit.attacker.range) return chase(state, unit, target);
  if (unit.mover) state.world.removeComponent(unit, 'mover');
  if (unit.attacker.readyAt <= state.time) strike(state, unit, target);
}

/** Units attack their targets. Player units also defend themselves. */
export function combatSystem(state: GameState): void {
  for (const unit of [...state.world.with('attacker', 'position')]) {
    if (state.world.has(unit)) fight(state, unit);
  }
}
