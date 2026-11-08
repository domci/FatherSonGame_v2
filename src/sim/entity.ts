import type { BuildingId } from '../content/buildings';
import type { UnitId } from '../content/units';

export type PlayerId = 'player' | 'ai' | 'wild';

export interface Vec2 {
  x: number;
  y: number;
}

export interface BuildingData {
  type: BuildingId;
  level: number;
  /** Top-left tile. */
  tileX: number;
  tileY: number;
}

/** A building that is being built or upgraded. */
export interface ConstructionData {
  targetLevel: number;
  startedAt: number;
  finishAt: number;
  droneId: number;
}

export interface TrainingData {
  unit: UnitId;
  finishAt: number;
  queue: UnitId[];
}

export interface MoverData {
  path: Vec2[];
  speed: number;
  flying: boolean;
}

export interface AttackerData {
  damage: number;
  range: number;
  cooldownMs: number;
  readyAt: number;
  targetId?: number;
}

export interface SpiderData {
  nestId: number;
  mode: 'roam' | 'attack';
  nextThinkAt: number;
}

export interface NestData {
  nextSpawnAt: number;
  nextEggAt: number;
  maxSpiders: number;
}

export type ShipPhase = 'docked' | 'outbound' | 'mining' | 'returning';

export interface ShipData {
  phase: ShipPhase;
  targetBodyId?: string;
  phaseStartAt: number;
  phaseEndsAt: number;
  cargo: number;
  capacity: number;
  /** Keep flying to the same target until stopped. */
  repeat: boolean;
}

/**
 * One thing in the game world. Every field is an optional "component".
 * Only plain data here (no functions, no classes), so it can be saved as JSON.
 */
export interface Entity {
  id: number;
  owner?: PlayerId;
  /** Which surface (planet id) the entity is on. */
  zone?: string;
  position?: Vec2;
  health?: { hp: number; max: number };
  building?: BuildingData;
  construction?: ConstructionData;
  training?: TrainingData;
  unit?: { type: UnitId };
  /** Drone that is busy building something. */
  busyWith?: { entityId: number };
  mover?: MoverData;
  attacker?: AttackerData;
  spider?: SpiderData;
  nest?: NestData;
  egg?: { laidAt: number };
  ship?: ShipData;
}
