import { World } from 'miniplex';
import type { Difficulty } from '../content/ai';
import { FACTIONS } from '../content/factions';
import type { Entity, PlayerId } from './entity';
import { generateSolarSystem } from './generation/solar-system';
import { generateSurface } from './generation/surface';
import { createRng } from './rng';
import { ensureOpponent, makePlayer, setupBase, setupNests } from './setup';
import {
  SAVE_VERSION,
  type Faction,
  type GameEvent,
  type GameState,
  type PlayerState,
} from './state';

export interface NewGameOptions {
  seed: number;
  faction: Faction;
  /** Game start time in ms. */
  time: number;
  difficulty?: Difficulty;
  offlineAttacks?: boolean;
  /** false = no computer enemy (for economy tests). */
  opponent?: boolean;
}

/** Creates the start of a new game: crash site, two drones, spider nests and the enemy. */
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
    settings: {
      difficulty: options.difficulty ?? 'normal',
      offlineAttacks: options.offlineAttacks ?? false,
      opponent: options.opponent !== false,
    },
    ai: {},
    marks: [],
  };
  setupBase(state, 'player', map);
  setupNests(state, map);
  if (state.settings.opponent) ensureOpponent(state);
  addEvent(state, FACTIONS[options.faction].intro, 'info');
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
