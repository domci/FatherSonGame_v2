import { BUILDINGS, buildingLevel } from '../../content/buildings';
import type { PlayerId } from '../entity';
import { playerStats } from '../stats';
import type { GameState } from '../state';

/** Shields recharge and force fields repair themselves while there is enough energy. */
export function defenseSystem(state: GameState, dtMs: number): void {
  const powered = new Map<PlayerId, boolean>();
  const isPowered = (owner: PlayerId): boolean => {
    let p = powered.get(owner);
    if (p === undefined) {
      p = playerStats(state, owner).efficiency >= 1;
      powered.set(owner, p);
    }
    return p;
  };
  const seconds = dtMs / 1000;
  for (const e of state.world.with('building', 'health')) {
    if (e.building.level < 1 || !e.owner || e.construction) continue;
    const lvl = buildingLevel(BUILDINGS[e.building.type], e.building.level);
    if (!lvl.regen && !lvl.shield) continue;
    if (!isPowered(e.owner)) continue;
    if (lvl.regen) e.health.hp = Math.min(e.health.max, e.health.hp + lvl.regen * seconds);
    if (lvl.shield && e.shield)
      e.shield.hp = Math.min(e.shield.max, e.shield.hp + lvl.shield.recharge * seconds);
  }
}
