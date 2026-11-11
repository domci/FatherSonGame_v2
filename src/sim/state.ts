import type { World } from 'miniplex';
import type { Difficulty } from '../content/ai';
import type { Faction } from '../content/factions';
import type { ResearchId } from '../content/research';
import type { ResourceAmounts } from '../content/resources';
import type { Entity, PlayerId } from './entity';
import type { SolarSystem } from './generation/solar-system';
import type { SurfaceMap } from './generation/surface';

export type { Faction };

export interface ResearchState {
  done: ResearchId[];
  current?: { id: ResearchId; finishAt: number };
}

export interface PlayerState {
  id: PlayerId;
  faction: Faction;
  resources: ResourceAmounts;
  research: ResearchState;
  homeBodyId: string;
  /** Fog of war: explored tiles per surface, one char per tile ('1' = seen). */
  explored?: Record<string, string>;
}

/** Memory of the computer player. */
export interface AiState {
  nextThinkAt: number;
  nextAttackAt: number;
  waves: number;
  /** Own difficulty (balancing runs); default: the game setting. */
  difficulty?: Difficulty;
  /** Balancing runs only: plays at full strength, without the level matching. */
  free?: boolean;
  /** Balancing runs only: time between two thoughts (a slower player). */
  thinkMs?: number;
}

export interface GameSettings {
  difficulty: Difficulty;
  /** false = nobody attacks you while the game is closed. */
  offlineAttacks: boolean;
  /** Is there a computer enemy? (false only in tests) */
  opponent: boolean;
}

/** Short-lived marks for effects (explosions). Not saved. */
export interface Mark {
  time: number;
  zone: string;
  x: number;
  y: number;
  /** strike = a shot from orbit hit here. */
  kind: 'unit' | 'building' | 'spider' | 'egg' | 'strike';
  owner?: PlayerId;
}

export interface GameEvent {
  time: number;
  text: string;
  kind: 'info' | 'good' | 'bad';
}

/** Everything about one running game. */
export interface GameState {
  version: number;
  seed: number;
  rngState: number;
  nextId: number;
  /** Game time in ms (like a clock). Build timers use this. */
  time: number;
  world: World<Entity>;
  players: Partial<Record<PlayerId, PlayerState>>;
  system: SolarSystem;
  surfaces: Record<string, SurfaceMap>;
  events: GameEvent[];
  settings: GameSettings;
  ai: Partial<Record<PlayerId, AiState>>;
  /** Set when the game is over. */
  winner?: PlayerId;
  marks: Mark[];
}

export const SAVE_VERSION = 2;
