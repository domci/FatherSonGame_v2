import type { ResourceAmounts } from './resources';
import type { ResearchId } from './research';
import type { Hits, UnitId } from './units';
import { BUILDING_LIST } from './building-list';
import { stageSeconds } from './time-curve';

export type BuildingId =
  | 'commandDome'
  | 'solarField'
  | 'regolithExcavator'
  | 'habitatDome'
  | 'storage'
  | 'pinkPump'
  | 'waterOxygenPlant'
  | 'greenhouse'
  | 'huntingLodge'
  | 'lab'
  | 'diamondDrill'
  | 'spaceport'
  | 'barracks'
  | 'vehicleFactory'
  | 'wall'
  | 'turret'
  | 'shieldReactor'
  | 'forceField'
  | 'airfield'
  | 'flakTower'
  | 'orbitalCannon';

export type BuildingCategory =
  | 'command'
  | 'energy'
  | 'mining'
  | 'housing'
  | 'processing'
  | 'food'
  | 'military'
  | 'research'
  | 'space'
  | 'defense';

/** A gun on a building (turret). */
export interface WeaponDef {
  damage: number;
  /** Range in tiles. */
  range: number;
  cooldownMs: number;
  /** What it can hit (default: ground). 'space' = ships in orbit above the planet. */
  hits?: Hits | 'space';
}

/** A shield bubble around a building. It takes damage for everything inside. */
export interface ShieldDef {
  capacity: number;
  /** Radius in tiles. */
  radius: number;
  /** Shield points per second while there is enough energy. */
  recharge: number;
}

/** Values for one building level. Rates are per minute. */
export interface BuildingLevel {
  cost: ResourceAmounts;
  hp: number;
  /** Positive = makes energy, negative = uses energy. */
  energy: number;
  produces?: ResourceAmounts;
  consumes?: ResourceAmounts;
  storage?: number;
  housing?: number;
  /** Takes this much less damage per hit. */
  armor?: number;
  weapon?: WeaponDef;
  shield?: ShieldDef;
  /** Repairs itself (hp per second) while there is enough energy. */
  regen?: number;
}

export interface BuildingDef {
  id: BuildingId;
  name: string;
  description: string;
  category: BuildingCategory;
  /** Size in tiles (square). */
  size: number;
  /** Time stage of level 1 (see time-curve). */
  tier: number;
  levels: readonly BuildingLevel[];
  /** Must stand on this kind of deposit. */
  needsDeposit?: 'pink' | 'diamond';
  requires?: ResearchId;
  trains?: readonly UnitId[];
  /** Cannot be built by the player (e.g. the crashed ship). */
  unique?: boolean;
  /** Fixed build time in seconds for every level (small things like walls). */
  buildSeconds?: number;
}

export const BUILDINGS: Record<BuildingId, BuildingDef> = Object.fromEntries(
  BUILDING_LIST.map((b) => [b.id, b]),
) as Record<BuildingId, BuildingDef>;

export function buildingLevel(def: BuildingDef, level: number): BuildingLevel {
  const data = def.levels[Math.min(Math.max(level, 1), def.levels.length) - 1];
  if (!data) throw new Error(`Building ${def.id} has no levels`);
  return data;
}

/** Seconds to build (level 1) or upgrade to `level`. */
export function buildTimeSeconds(def: BuildingDef, level: number): number {
  return def.buildSeconds ?? stageSeconds(def.tier + level - 1);
}
