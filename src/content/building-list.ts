import { ADVANCED_BUILDINGS } from './buildings-advanced';
import { BASIC_BUILDINGS } from './buildings-basic';
import type { BuildingDef } from './buildings';

/** All buildings with their values. */
export const BUILDING_LIST: readonly BuildingDef[] = [...BASIC_BUILDINGS, ...ADVANCED_BUILDINGS];
