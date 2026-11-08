import { BUILDINGS, buildingLevel } from '../content/buildings';
import { BASE_STORAGE } from '../content/resources';
import { UNITS } from '../content/units';
import type { Entity, PlayerId } from './entity';
import type { GameState } from './state';
import { findBody } from './generation/solar-system';
import { hasResearch } from './research-helpers';

export interface PlayerStats {
  energyMade: number;
  energyUsed: number;
  /** 0..1, how well buildings run. Below 1 when energy is missing. */
  efficiency: number;
  storage: number;
  housing: number;
  housingUsed: number;
  drones: number;
  freeDrones: number;
}

/** Only finished buildings (level >= 1) count. Buildings under construction do nothing. */
export function activeBuildings(state: GameState, owner: PlayerId): Entity[] {
  return state.world
    .with('building')
    .entities.filter((e) => e.owner === owner && e.building.level >= 1);
}

function solarBonus(state: GameState, owner: PlayerId): number {
  const player = state.players[owner];
  if (!player) return 1;
  const body = findBody(state.system, player.homeBodyId);
  const research = hasResearch(state, owner, 'betterSolar') ? 1.25 : 1;
  return (body?.solarFactor ?? 1) * research;
}

function countUnits(state: GameState, owner: PlayerId) {
  const units = state.world.with('unit').entities.filter((e) => e.owner === owner);
  const drones = units.filter((u) => u.unit.type === 'drone');
  return {
    housingUsed: units.reduce((sum, u) => sum + UNITS[u.unit.type].housing, 0),
    drones: drones.length,
    freeDrones: drones.filter((d) => !d.busyWith).length,
  };
}

export function playerStats(state: GameState, owner: PlayerId): PlayerStats {
  let energyMade = 0;
  let energyUsed = 0;
  let storage = BASE_STORAGE;
  let housing = 0;
  const solar = solarBonus(state, owner);
  for (const e of activeBuildings(state, owner)) {
    if (!e.building) continue;
    const def = BUILDINGS[e.building.type];
    const lvl = buildingLevel(def, e.building.level);
    if (lvl.energy > 0) energyMade += lvl.energy * (def.category === 'energy' ? solar : 1);
    else energyUsed -= lvl.energy;
    storage += lvl.storage ?? 0;
    housing += lvl.housing ?? 0;
  }
  const efficiency = energyUsed <= 0 ? 1 : Math.min(1, energyMade / energyUsed);
  return { energyMade, energyUsed, efficiency, storage, housing, ...countUnits(state, owner) };
}
