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
  /** Stop and fight enemies on the way. */
  attackMove?: boolean;
}

export interface AttackerData {
  damage: number;
  range: number;
  cooldownMs: number;
  readyAt: number;
  targetId?: number;
  /** Last shot (for laser effects and sounds). */
  shot?: { at: number; x: number; y: number };
  /** Idle: next time to look around for enemies (saves work). */
  scanAt?: number;
}

/** Shield bubble of a shield reactor. */
export interface ShieldData {
  hp: number;
  max: number;
  radius: number;
  /** Last time the shield took a hit (for effects). */
  hitAt: number;
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

export type ShipPhase = 'docked' | 'outbound' | 'mining' | 'returning' | 'landed';

export interface ShipData {
  phase: ShipPhase;
  targetBodyId?: string;
  phaseStartAt: number;
  phaseEndsAt: number;
  cargo: number;
  capacity: number;
  /** Keep flying to the same target until stopped. */
  repeat: boolean;
  /** Transport ships: where the ship flies from (planet id). */
  fromBodyId?: string;
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
  shield?: ShieldData;
  /** Unit sits inside a transport ship. */
  aboard?: { shipId: number };
}
