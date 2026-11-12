import { World } from 'miniplex';
import type { Difficulty } from '../content/ai';
import { FACTIONS } from '../content/factions';
import type { Entity, PlayerId, SideId } from './entity';
import { generateSolarSystem } from './generation/solar-system';
import { generateSurface } from './generation/surface';
import { createRng } from './rng';
import { ensureOpponents, homeCount, makePlayer, setupBase, setupNests } from './setup';
import {
  SAVE_VERSION,
  type Faction,
  type GameEvent,
  type GameSettings,
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
  /** Number of computer sides, 1..3 (default 1). */
  opponents?: number;
  /** Online world (M7): places for more people after the computer sides. */
  online?: { humans: number };
}

/** Creates the start of a new game: crash site, two drones, spider nests and the enemy. */
export function createGame(options: NewGameOptions): GameState {
  const settings: GameSettings = {
    difficulty: options.difficulty ?? 'normal',
    offlineAttacks: options.offlineAttacks ?? false,
    opponent: options.opponent !== false,
    opponents: options.opponent === false ? 0 : (options.opponents ?? 1),
    ...(options.online ? { online: true, humans: options.online.humans } : {}),
  };
  const system = generateSolarSystem(options.seed, homeCount(settings));
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
    settings,
    ai: {},
    relations: {},
    offers: [],
    marks: [],
  };
  setupBase(state, 'player', map);
  setupNests(state, map);
  ensureOpponents(state);
  addEvent(state, FACTIONS[options.faction].intro, 'info');
  return state;
}

/** Most events kept (for all players together). */
const MAX_EVENTS = 80;

/** A news line. With `to`, only that side sees it (online games have more than one person). */
export function addEvent(
  state: GameState,
  text: string,
  kind: GameEvent['kind'],
  to?: SideId,
): void {
  state.events.push(to ? { time: state.time, text, kind, to } : { time: state.time, text, kind });
  if (state.events.length > MAX_EVENTS) state.events.shift();
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
