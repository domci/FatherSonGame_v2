import { sendTo } from '../commands/units';
import type { Entity } from '../entity';
import { findEntity } from '../spawn';
import type { GameState } from '../state';
import { dealDamage, hitDamage } from './damage';
import { aggroRange, distanceTo, nearestEnemy, targetsByZone } from './targeting';

export { distanceTo } from './targeting';

const MARK_MS = 3000;
/** Idle fighters look around this often. */
const SCAN_MS = 300;

type Targets = Map<string, Entity[]>;

function strike(state: GameState, unit: Entity, target: Entity): void {
  if (!unit.attacker || !target.health || !target.position) return;
  unit.attacker.readyAt = state.time + unit.attacker.cooldownMs;
  unit.attacker.shot = { at: state.time, x: target.position.x, y: target.position.y };
  dealDamage(state, target, hitDamage(state, unit, target), unit);
  if (!state.world.has(target)) delete unit.attacker.targetId;
}

/** Walks towards the target. Gives up if there is no way closer. */
function chase(state: GameState, unit: Entity, target: Entity): void {
  const path = unit.mover?.path;
  const goal = path?.[path.length - 1];
  const tp = target.position;
  if (!tp || !unit.attacker || unit.building) return;
  if (goal && Math.hypot(goal.x - tp.x, goal.y - tp.y) < 1) return;
  if (!sendTo(state, unit, tp, true) || !unit.mover) {
    delete unit.attacker.targetId;
  }
}

/** Idle (or attack-moving) fighters look around every SCAN_MS. */
function mayScan(state: GameState, unit: Entity): boolean {
  if (!unit.attacker || unit.owner === 'wild' || !unit.zone) return false;
  if (unit.mover && !unit.mover.attackMove) return false;
  if ((unit.attacker.scanAt ?? 0) > state.time) return false;
  unit.attacker.scanAt = state.time + SCAN_MS;
  return true;
}

function autoTarget(state: GameState, unit: Entity, targets: Targets): Entity | undefined {
  if (!unit.attacker || !unit.zone || !mayScan(state, unit)) return undefined;
  const reach = unit.building ? unit.attacker.range : aggroRange(unit);
  const found = nearestEnemy(unit, reach, targets.get(unit.zone) ?? []);
  if (found) {
    unit.attacker.targetId = found.id;
    if (unit.mover) state.world.removeComponent(unit, 'mover');
  }
  return found;
}

function currentTarget(state: GameState, unit: Entity, targets: Targets): Entity | undefined {
  if (!unit.attacker) return undefined;
  const id = unit.attacker.targetId;
  const target = id === undefined ? undefined : findEntity(state, id);
  const valid = target?.health && target.zone === unit.zone && !target.aboard;
  if (target && valid) {
    const tooFar =
      unit.building && unit.position && distanceTo(unit.position, target) > unit.attacker.range;
    if (!tooFar) return target;
  }
  delete unit.attacker.targetId;
  return autoTarget(state, unit, targets);
}

function fight(state: GameState, unit: Entity, targets: Targets): void {
  if (!unit.attacker || !unit.position || unit.aboard || unit.construction) return;
  const target = currentTarget(state, unit, targets);
  if (!target) return;
  if (!state.world.has(target)) {
    delete unit.attacker.targetId;
    return;
  }
  if (distanceTo(unit.position, target) > unit.attacker.range) return chase(state, unit, target);
  if (unit.mover) state.world.removeComponent(unit, 'mover');
  if (unit.attacker.readyAt <= state.time) strike(state, unit, target);
}

/** Units and turrets attack. Idle fighters defend themselves. */
export function combatSystem(state: GameState): void {
  const targets = targetsByZone(state);
  for (const unit of [...state.world.with('attacker', 'position')]) {
    if (state.world.has(unit)) fight(state, unit, targets);
  }
  if (state.marks.length && state.marks[0] && state.marks[0].time < state.time - MARK_MS) {
    state.marks = state.marks.filter((m) => m.time >= state.time - MARK_MS);
  }
}
