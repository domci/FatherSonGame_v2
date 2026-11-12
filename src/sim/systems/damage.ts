import { BUILDINGS, buildingLevel } from '../../content/buildings';
import { EGG_FOOD, SPIDER_FOOD, UNITS } from '../../content/units';
import { addEvent } from '../game';
import type { Entity, PlayerId } from '../entity';
import { defeat } from '../defeat';
import { nameOfBuilding } from '../names';
import { hostile, isSide } from '../relations';
import { hasResearch } from '../research-helpers';
import { findEntity } from '../spawn';
import { playerStats } from '../stats';
import type { GameState, Mark } from '../state';
import { addResources } from '../wallet';

export function armorOf(state: GameState, e: Entity): number {
  if (e.building) {
    if (e.building.level < 1) return 0;
    return buildingLevel(BUILDINGS[e.building.type], e.building.level).armor ?? 0;
  }
  if (!e.unit) return 0;
  const bonus = e.owner && hasResearch(state, e.owner, 'armor') ? 2 : 0;
  return UNITS[e.unit.type].armor + bonus;
}

/** Damage of one hit after armor. Always at least 1. */
export function hitDamage(state: GameState, shooter: Entity, target: Entity): number {
  if (!shooter.attacker) return 0;
  let dmg = shooter.attacker.damage;
  if (shooter.owner && hasResearch(state, shooter.owner, 'strongLasers')) dmg *= 1.25;
  const vs = shooter.unit ? UNITS[shooter.unit.type].vsBuildings : undefined;
  if (target.building && vs) dmg *= vs;
  return Math.max(1, Math.round(dmg - armorOf(state, target)));
}

/** A powered shield bubble of the same owner that covers the target. */
export function protectingShield(state: GameState, target: Entity): Entity | undefined {
  const p = target.position;
  if (!p || !target.owner) return undefined;
  for (const s of state.world.with('shield', 'position')) {
    if (s.owner !== target.owner || s.zone !== target.zone || s.shield.hp <= 0) continue;
    if (Math.hypot(s.position.x - p.x, s.position.y - p.y) <= s.shield.radius) {
      return playerStats(state, s.owner).efficiency >= 1 ? s : undefined;
    }
  }
  return undefined;
}

function reward(state: GameState, dead: Entity, killer: Entity | undefined): void {
  const food = dead.egg ? EGG_FOOD : dead.unit?.type === 'spider' ? SPIDER_FOOD : 0;
  const player = killer?.owner ? state.players[killer.owner] : undefined;
  if (!food || !player) return;
  addResources(player, { food }, playerStats(state, player.id).storage);
  if (player.id === 'player')
    addEvent(state, `+${food} Nahrung (${dead.egg ? 'Ei' : 'Spinne'}).`, 'good');
}

function markKind(dead: Entity): Mark['kind'] {
  if (dead.building || dead.nest) return 'building';
  if (dead.egg) return 'egg';
  return dead.unit?.type === 'spider' ? 'spider' : 'unit';
}

function addMark(state: GameState, dead: Entity): void {
  if (!dead.position || !dead.zone) return;
  const { x, y } = dead.position;
  state.marks.push({
    time: state.time,
    zone: dead.zone,
    x,
    y,
    kind: markKind(dead),
    owner: dead.owner,
  });
}

function lostBuilding(state: GameState, dead: Entity, owner: PlayerId, killer?: Entity): void {
  if (!dead.building || !isSide(owner)) return;
  const type = dead.building.type;
  if (type === 'commandDome') return defeat(state, owner, killer?.owner);
  if (owner === 'player')
    addEvent(state, `${nameOfBuilding(state, owner, type)} wurde zerstört!`, 'bad');
  else if (type !== 'wall' && type !== 'forceField' && hostile(state, 'player', owner))
    addEvent(state, `Feind: ${nameOfBuilding(state, owner, type)} zerstört.`, 'good');
}

/** Removes a dead thing, gives rewards and checks for the end of the game. */
export function killed(state: GameState, dead: Entity, killer?: Entity): void {
  reward(state, dead, killer);
  if (dead.construction) {
    const drone = findEntity(state, dead.construction.droneId);
    if (drone?.busyWith) state.world.removeComponent(drone, 'busyWith');
  }
  if (dead.ship) {
    for (const p of state.world.with('aboard'))
      if (p.aboard.shipId === dead.id) state.world.remove(p);
  }
  if (dead.owner) lostBuilding(state, dead, dead.owner, killer);
  addMark(state, dead);
  state.world.remove(dead);
}

/** Hurts a target. A shield bubble takes the damage first. */
export function dealDamage(
  state: GameState,
  target: Entity,
  amount: number,
  killer?: Entity,
): void {
  if (!target.health) return;
  const shield = protectingShield(state, target)?.shield;
  if (shield) {
    const absorbed = Math.min(shield.hp, amount);
    shield.hp -= absorbed;
    shield.hitAt = state.time;
    amount -= absorbed;
  }
  target.health.hp -= amount;
  if (target.health.hp <= 0) killed(state, target, killer);
}
