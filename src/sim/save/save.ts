import { World } from 'miniplex';
import type { Entity, PlayerId } from '../entity';
import { generateSolarSystem } from '../generation/solar-system';
import { generateSurface } from '../generation/surface';
import { SAVE_VERSION, type GameEvent, type GameState, type PlayerState } from '../state';
import { migrate } from './migrations';

/** Deep copy of plain data. */
function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** What is written to storage. The map and solar system are rebuilt from the seed. */
export interface SaveData {
  version: number;
  seed: number;
  rngState: number;
  nextId: number;
  time: number;
  /** Real time (Date.now()) when saved. Used to calculate offline time. */
  savedAt: number;
  zones: string[];
  players: Partial<Record<PlayerId, PlayerState>>;
  entities: Entity[];
  events: GameEvent[];
}

export function toSaveData(state: GameState, savedAt: number): SaveData {
  return clone({
    version: SAVE_VERSION,
    seed: state.seed,
    rngState: state.rngState,
    nextId: state.nextId,
    time: state.time,
    savedAt,
    zones: Object.keys(state.surfaces),
    players: state.players,
    entities: [...state.world.entities],
    events: state.events,
  });
}

export function fromSaveData(raw: unknown): GameState {
  const data = migrate(raw);
  const surfaces = Object.fromEntries(data.zones.map((z) => [z, generateSurface(data.seed, z)]));
  return {
    version: SAVE_VERSION,
    seed: data.seed,
    rngState: data.rngState,
    nextId: data.nextId,
    time: data.time,
    world: new World<Entity>(clone(data.entities)),
    players: clone(data.players),
    system: generateSolarSystem(data.seed),
    surfaces,
    events: clone(data.events),
  };
}
