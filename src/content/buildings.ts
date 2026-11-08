import type { ResourceAmounts } from './resources';
import type { ResearchId } from './research';
import type { UnitId } from './units';
import { BUILDING_LIST } from './building-list';

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
  | 'spaceport';

export type BuildingCategory =
  | 'command'
  | 'energy'
  | 'mining'
  | 'housing'
  | 'processing'
  | 'food'
  | 'military'
  | 'research'
  | 'space';

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
}

export const BUILDINGS: Record<BuildingId, BuildingDef> = Object.fromEntries(
  BUILDING_LIST.map((b) => [b.id, b]),
) as Record<BuildingId, BuildingDef>;

export function buildingLevel(def: BuildingDef, level: number): BuildingLevel {
  const data = def.levels[Math.min(Math.max(level, 1), def.levels.length) - 1];
  if (!data) throw new Error(`Building ${def.id} has no levels`);
  return data;
}
