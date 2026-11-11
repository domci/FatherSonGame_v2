import type { World } from 'miniplex';
import type { Difficulty } from '../content/ai';
import type { Faction } from '../content/factions';
import type { ResearchId } from '../content/research';
import type { NeedId } from '../content/colony';
import type { ResourceAmounts } from '../content/resources';
import type { Entity, PlayerId } from './entity';
import type { SolarSystem } from './generation/solar-system';
import type { SurfaceMap } from './generation/surface';

export type { Faction };

export interface ResearchState {
  done: ResearchId[];
  current?: { id: ResearchId; finishAt: number };
}

/** The people in the domes (M5). */
export interface ColonyState {
  people: number;
  /** Sick people (part of `people`), can be a fraction. */
  sick: number;
  /** 0..100 */
  mood: number;
  /** Progress to the next new person (0..1). */
  grow: number;
  /** Progress to the next person who leaves (0..1). */
  leave: number;
  /** Share of each need that was there in the last step (0..1). */
  met: Record<NeedId, number>;
  /** Needs that are missing and were already reported. */
  warned: NeedId[];
}

/** The knowledge quiz of one player (M5). */
export interface QuizState {
  /** Questions asked in this round. A new round starts when all were asked. */
  asked: string[];
  /** Game times of the answers in the last hour (for the limit). */
  answers: number[];
  /** No new question before this time (after a wrong answer). */
  pauseUntil: number;
  /** The open question and the order of its answers (index into `answers` of the question). */
  current?: { id: string; order: number[] };
  right: number;
  wrong: number;
}

/** Progress in the first mission (M5). */
export interface MissionState {
  /** Number of the step to do now (= steps done). */
  step: number;
  /** The player closed the mission. */
  off: boolean;
}

export interface PlayerState {
  id: PlayerId;
  faction: Faction;
  resources: ResourceAmounts;
  research: ResearchState;
  homeBodyId: string;
  colony: ColonyState;
  quiz: QuizState;
  mission: MissionState;
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

export const SAVE_VERSION = 3;
