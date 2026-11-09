import { AI_TUNING } from '../content/ai';
import { otherFaction } from '../content/factions';
import { START_RESOURCES } from '../content/resources';
import { MINUTE } from './clock';
import type { PlayerId } from './entity';
import { generateSurface, type SurfaceMap } from './generation/surface';
import { spawn, spawnBuilding, spawnUnit } from './spawn';
import type { Faction, GameState, PlayerState } from './state';

export function makePlayer(id: PlayerId, faction: Faction, homeBodyId: string): PlayerState {
  return {
    id,
    faction,
    resources: { ...START_RESOURCES },
    research: { done: [] },
    homeBodyId,
    explored: {},
  };
}

/** Command building and two drones at the landing site of a surface. */
export function setupBase(state: GameState, owner: PlayerId, map: SurfaceMap): void {
  const { tileX, tileY } = map.landing;
  spawnBuilding(state, owner, map.bodyId, { type: 'commandDome', tileX, tileY, level: 1 });
  for (let i = 0; i < 2; i++) {
    spawnUnit(state, owner, map.bodyId, 'drone', { x: tileX + 1 + i * 2, y: tileY + 5 });
  }
}

export function setupNests(state: GameState, map: SurfaceMap): void {
  for (const n of map.nests) {
    spawn(state, {
      owner: 'wild',
      zone: map.bodyId,
      position: { ...n },
      nest: { nextSpawnAt: state.time, nextEggAt: state.time + 3 * MINUTE, maxSpiders: 3 },
      health: { hp: 600, max: 600 },
    });
  }
}

/** Adds the computer enemy on its own planet (also for old saves without one). */
export function ensureOpponent(state: GameState): void {
  const player = state.players.player;
  if (state.players.ai || !player) return;
  const zone = state.system.alienBodyId;
  const map = (state.surfaces[zone] ??= generateSurface(state.seed, zone));
  state.players.ai = makePlayer('ai', otherFaction(player.faction), zone);
  const tuning = AI_TUNING[state.settings.difficulty];
  state.ai.ai = {
    nextThinkAt: state.time,
    nextAttackAt: state.time + tuning.firstAttackMs,
    waves: 0,
  };
  setupBase(state, 'ai', map);
}
