import { AI_TUNING } from '../content/ai';
import { START_RESOURCES } from '../content/resources';
import { aiFaction, PLAYER_NAME, SIDE_COLORS, SIDE_NAMES } from '../content/sides';
import { MINUTE } from './clock';
import { newColony } from './colony';
import { newQuiz } from './quiz';
import { newMission } from './systems/mission';
import { AI_IDS, type AiId, type PlayerId, type SideId } from './entity';
import { generateSurface, type SurfaceMap } from './generation/surface';
import { spawn, spawnBuilding, spawnUnit } from './spawn';
import type { Faction, GameSettings, GameState, PlayerState } from './state';

/** Name of a side: "Ihr" for the player, the next free name of its people for a computer. */
export function sideName(id: SideId, faction: Faction): string {
  if (id === 'player') return PLAYER_NAME;
  const names = SIDE_NAMES[faction];
  const nth = Math.floor(AI_IDS.indexOf(id) / 2);
  return names[nth % names.length] ?? id;
}

export function makePlayer(id: SideId, faction: Faction, homeBodyId: string): PlayerState {
  return {
    id,
    faction,
    name: sideName(id, faction),
    color: SIDE_COLORS[id],
    resources: { ...START_RESOURCES },
    research: { done: [] },
    homeBodyId,
    colony: newColony(),
    quiz: newQuiz(),
    mission: newMission(),
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

/** Number of computer sides this game should have. */
export function opponentCount(state: GameState): number {
  if (!state.settings.opponent) return 0;
  return Math.max(1, Math.min(AI_IDS.length, state.settings.opponents || 1));
}

/** Planets with a home: the player and each computer side (at least 2, as in old saves). */
export function homeCount(settings: GameSettings): number {
  return settings.opponent ? Math.max(2, settings.opponents + 1) : 2;
}

/** Time between the first attacks of two computer sides (they do not all come at once). */
const FIRST_ATTACK_STEP = 10 * MINUTE;

function addOpponent(state: GameState, id: AiId, index: number, faction: Faction): void {
  const zone = state.system.homes[index + 1] ?? state.system.alienBodyId;
  const map = (state.surfaces[zone] ??= generateSurface(state.seed, zone));
  state.players[id] = makePlayer(id, aiFaction(faction, index), zone);
  const tuning = AI_TUNING[state.settings.difficulty];
  state.ai[id] = {
    nextThinkAt: state.time,
    nextAttackAt: state.time + tuning.firstAttackMs + index * FIRST_ATTACK_STEP,
    waves: 0,
  };
  setupBase(state, id, map);
}

/** Adds the computer sides, each on its own planet (also for old saves without them). */
export function ensureOpponents(state: GameState): void {
  const player = state.players.player;
  if (!player) return;
  const count = opponentCount(state);
  AI_IDS.slice(0, count).forEach((id, i) => {
    if (!state.players[id]) addOpponent(state, id, i, player.faction);
  });
}
