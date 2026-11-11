import type { Entity } from '../entity';
import type { GameState } from '../state';
import { dealDamage, hitDamage } from '../systems/damage';
import { blockers } from './places';

export interface BlockadeOptions {
  /** The game is closed right now (catch-up). */
  offline: boolean;
}

/** Does a blockade hit this ship now? Nobody attacks the player while the game is closed (setting). */
export function isBlocked(
  state: GameState,
  ship: Entity,
  place: string,
  opts: BlockadeOptions,
): boolean {
  if (!ship.owner || ship.owner === 'wild') return false;
  if (opts.offline && ship.owner === 'player' && !state.settings.offlineAttacks) return false;
  return blockers(state, ship.owner, place).length > 0;
}

/**
 * Every enemy war ship at the place shoots once at a ship that arrives.
 * Returns true if the ship survived.
 */
export function runBlockade(state: GameState, ship: Entity, place: string): boolean {
  if (!ship.owner) return true;
  for (const enemy of blockers(state, ship.owner, place)) {
    if (!state.world.has(ship)) break;
    dealDamage(state, ship, hitDamage(state, enemy, ship), enemy);
  }
  return state.world.has(ship);
}
