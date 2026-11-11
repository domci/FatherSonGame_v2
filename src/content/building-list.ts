import { ADVANCED_BUILDINGS } from './buildings-advanced';
import { AIR_SPACE_BUILDINGS } from './buildings-air-space';
import { BASIC_BUILDINGS } from './buildings-basic';
import { MILITARY_BUILDINGS } from './buildings-military';
import type { BuildingDef } from './buildings';

/** All buildings with their values. */
export const BUILDING_LIST: readonly BuildingDef[] = [
  ...BASIC_BUILDINGS,
  ...ADVANCED_BUILDINGS,
  ...MILITARY_BUILDINGS,
  ...AIR_SPACE_BUILDINGS,
];
