import type { World } from 'miniplex';
import type { Difficulty } from '../content/ai';
import type { Faction } from '../content/factions';
import type { ResearchId } from '../content/research';
import type { NeedId } from '../content/colony';
import type { ResourceAmounts } from '../content/resources';
import type { Entity, PlayerId, SideId } from './entity';
import type { RelationKind } from '../content/sides';
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
  id: SideId;
  faction: Faction;
  resources: ResourceAmounts;
  research: ResearchState;
  homeBodyId: string;
  colony: ColonyState;
  quiz: QuizState;
  mission: MissionState;
  /** Shown name ("Ihr", "Schwarm Xar"). */
  name: string;
  /** Color of the side (lists, labels), CSS hex. */
  color: string;
  /** Lost its main dome: out of the game (M6). */
  defeated?: boolean;
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
  /** Next time it thinks about peace, alliances and war. */
  nextTalkAt?: number;
  /** Sides that broke peace or an alliance with it: no alliance with them again. */
  distrust?: SideId[];
}

/** Relation between two sides. No entry = war (everybody against everybody at the start). */
export interface Relation {
  kind: RelationKind;
  /** Game time of the last change. */
  since: number;
}

/** An offer of a computer side to the player (the player answers in the peoples window). */
export interface Offer {
  from: SideId;
  to: SideId;
  kind: 'peace' | 'alliance';
  until: number;
}

export interface GameSettings {
  difficulty: Difficulty;
  /** false = nobody attacks you while the game is closed. */
  offlineAttacks: boolean;
  /** Is there a computer enemy? (false only in tests) */
  opponent: boolean;
  /** Number of computer sides (1..3). */
  opponents: number;
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
  /** Relations by pair key (see sim/relations.ts). Missing = war. */
  relations: Record<string, Relation>;
  offers: Offer[];
  /** Set when the game is over: 'player' = you (and your allies) won, else who beat you. */
  winner?: PlayerId;
  marks: Mark[];
}

export const SAVE_VERSION = 4;
