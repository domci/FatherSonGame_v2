import { createGame } from './game';
import type { GameState } from './state';
import type { Entity } from './entity';
import type { BuildingId } from '../content/buildings';
import { BUILDINGS } from '../content/buildings';
import { placementProblem } from './occupancy';

/** Helpers for tests only. */
/** A game without the computer enemy (economy tests). */
export function newTestGame(seed = 1): GameState {
  return createGame({ seed, faction: 'human', time: 0, opponent: false });
}

/** A full game with the computer enemy. */
export function newBattleGame(seed = 1): GameState {
  return createGame({ seed, faction: 'human', time: 0 });
}

export function homeZone(state: GameState): string {
  return state.system.homeBodyId;
}

export function drones(state: GameState): Entity[] {
  return state.world.with('unit').entities.filter((e) => e.unit.type === 'drone');
}

/** Finds a free spot for a building, searching outward from the landing site. */
export function freeSpot(state: GameState, type: BuildingId): { tileX: number; tileY: number } {
  const zone = homeZone(state);
  const map = state.surfaces[zone];
  if (!map) throw new Error('no map');
  const deposit = BUILDINGS[type].needsDeposit;
  if (deposit) {
    const d = map.deposits.find((x) => x.kind === deposit);
    if (d) return { tileX: d.tileX, tileY: d.tileY };
  }
  for (let r = 3; r < map.size; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const tileX = map.size / 2 + dx;
        const tileY = map.size / 2 + dy;
        if (!placementProblem(state, zone, type, tileX, tileY)) return { tileX, tileY };
      }
    }
  }
  throw new Error('no free spot');
}

export function buildingsOf(state: GameState, type: BuildingId): Entity[] {
  return state.world.with('building').entities.filter((e) => e.building.type === type);
}
