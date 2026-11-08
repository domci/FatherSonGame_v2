import type { World } from 'miniplex';
import type { ResearchId } from '../content/research';
import type { ResourceAmounts } from '../content/resources';
import type { Entity, PlayerId } from './entity';
import type { SolarSystem } from './generation/solar-system';
import type { SurfaceMap } from './generation/surface';

export type Faction = 'human' | 'alien';

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
}

export const SAVE_VERSION = 1;
