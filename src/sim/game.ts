import { World } from 'miniplex';
import { START_RESOURCES } from '../content/resources';
import type { Entity, PlayerId } from './entity';
import { generateSolarSystem } from './generation/solar-system';
import { generateSurface, type SurfaceMap } from './generation/surface';
import { createRng } from './rng';
import { spawn, spawnBuilding, spawnUnit } from './spawn';
import {
  SAVE_VERSION,
  type Faction,
  type GameEvent,
  type GameState,
  type PlayerState,
} from './state';
import { MINUTE } from './clock';

export interface NewGameOptions {
  seed: number;
  faction: Faction;
  /** Game start time in ms. */
  time: number;
}

function makePlayer(id: PlayerId, faction: Faction, homeBodyId: string): PlayerState {
  return { id, faction, resources: { ...START_RESOURCES }, research: { done: [] }, homeBodyId };
}

function setupLanding(state: GameState, map: SurfaceMap): void {
  const { tileX, tileY } = map.landing;
  spawnBuilding(state, 'player', map.bodyId, { type: 'commandDome', tileX, tileY, level: 1 });
  for (let i = 0; i < 2; i++) {
    spawnUnit(state, 'player', map.bodyId, 'drone', { x: tileX + 1 + i * 2, y: tileY + 5 });
  }
}

function setupNests(state: GameState, map: SurfaceMap): void {
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

/** Creates the start of a new game: crash site, two drones, spider nests. */
export function createGame(options: NewGameOptions): GameState {
  const system = generateSolarSystem(options.seed);
  const home = system.homeBodyId;
  const map = generateSurface(options.seed, home);
  const state: GameState = {
    version: SAVE_VERSION,
    seed: options.seed,
    rngState: createRng(options.seed).state(),
    nextId: 1,
    time: options.time,
    world: new World<Entity>(),
    players: { player: makePlayer('player', options.faction, home) },
    system,
    surfaces: { [home]: map },
    events: [],
  };
  setupLanding(state, map);
  setupNests(state, map);
  addEvent(state, 'Bruchlandung! Baut eure Basis auf.', 'info');
  return state;
}

export function addEvent(state: GameState, text: string, kind: GameEvent['kind']): void {
  state.events.push({ time: state.time, text, kind });
  if (state.events.length > 50) state.events.shift();
}

export function getPlayer(state: GameState, id: PlayerId): PlayerState {
  const p = state.players[id];
  if (!p) throw new Error(`No player ${id}`);
  return p;
}

/** Random numbers that continue from the saved state. */
export function nextRandom(state: GameState): number {
  const rng = createRng(state.rngState);
  const value = rng.next();
  state.rngState = rng.state();
  return value;
}
