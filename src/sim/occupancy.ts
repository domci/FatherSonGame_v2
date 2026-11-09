import { BUILDINGS, type BuildingId } from '../content/buildings';
import type { PlayerId } from './entity';
import type { GameState } from './state';
import { tunnelReaches } from './tunnels';
import type { SurfaceMap } from './generation/surface';

/** Grid of blocked tiles (rocks + buildings) for one surface. Index: y * size + x. */
export function blockedTiles(state: GameState, zone: string): boolean[] {
  const map = state.surfaces[zone];
  if (!map) return [];
  const blocked = [...map.rocks];
  for (const e of state.world.with('building')) {
    if (e.zone !== zone) continue;
    const size = BUILDINGS[e.building.type].size;
    for (let y = e.building.tileY; y < e.building.tileY + size; y++) {
      for (let x = e.building.tileX; x < e.building.tileX + size; x++)
        blocked[y * map.size + x] = true;
    }
  }
  return blocked;
}

export type PlacementProblem = 'outside' | 'blocked' | 'needsDeposit' | 'tooFar' | null;

function insideMap(map: SurfaceMap, x: number, y: number, size: number): boolean {
  return x >= 0 && y >= 0 && x + size <= map.size && y + size <= map.size;
}

function coversDeposit(
  map: SurfaceMap,
  kind: 'pink' | 'diamond',
  x: number,
  y: number,
  size: number,
): boolean {
  return map.deposits.some(
    (d) =>
      d.kind === kind &&
      d.tileX >= x &&
      d.tileY >= y &&
      d.tileX + d.size <= x + size &&
      d.tileY + d.size <= y + size,
  );
}

function touchesAnyDeposit(map: SurfaceMap, x: number, y: number, size: number): boolean {
  return map.deposits.some(
    (d) => d.tileX < x + size && d.tileX + d.size > x && d.tileY < y + size && d.tileY + d.size > y,
  );
}

/** Checks if a building can stand here. null = ok. With `owner`: also the tunnel rule. */
export function placementProblem(
  state: GameState,
  zone: string,
  type: BuildingId,
  tileX: number,
  tileY: number,
  owner?: PlayerId,
): PlacementProblem {
  const map = state.surfaces[zone];
  const def = BUILDINGS[type];
  if (!map || !insideMap(map, tileX, tileY, def.size)) return 'outside';
  const blocked = blockedTiles(state, zone);
  for (let y = tileY; y < tileY + def.size; y++) {
    for (let x = tileX; x < tileX + def.size; x++) if (blocked[y * map.size + x]) return 'blocked';
  }
  if (def.needsDeposit) {
    if (!coversDeposit(map, def.needsDeposit, tileX, tileY, def.size)) return 'needsDeposit';
  } else if (touchesAnyDeposit(map, tileX, tileY, def.size)) return 'blocked';
  if (owner && !tunnelReaches(state, owner, zone, type, tileX, tileY)) return 'tooFar';
  return null;
}
