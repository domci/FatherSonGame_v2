import { BUILDINGS, type BuildingId } from '../../content/buildings';
import type { PlayerId } from '../entity';
import { blockedTiles, placementProblem } from '../occupancy';
import type { GameState } from '../state';
import { coreOf } from './queries';

function hasMargin(blocked: boolean[], size: number, x: number, y: number, s: number): boolean {
  for (let ty = y - 1; ty <= y + s; ty++)
    for (let tx = x - 1; tx <= x + s; tx++) {
      if (tx < 0 || ty < 0 || tx >= size || ty >= size) return false;
      if (blocked[ty * size + tx]) return false;
    }
  return true;
}

/** A free deposit of the right kind (for pumps and drills). */
function depositSpot(
  state: GameState,
  zone: string,
  type: BuildingId,
): { tileX: number; tileY: number } | null {
  const map = state.surfaces[zone];
  for (const d of map?.deposits ?? []) {
    if (d.kind !== BUILDINGS[type].needsDeposit) continue;
    if (!placementProblem(state, zone, type, d.tileX, d.tileY))
      return { tileX: d.tileX, tileY: d.tileY };
  }
  return null;
}

/** Where the computer builds next: close to its base, with a free path around each building. */
export function findBuildSpot(
  state: GameState,
  owner: PlayerId,
  zone: string,
  type: BuildingId,
): { tileX: number; tileY: number } | null {
  if (BUILDINGS[type].needsDeposit) return depositSpot(state, zone, type);
  const map = state.surfaces[zone];
  const center = coreOf(state, owner)?.position;
  if (!map || !center) return null;
  const size = BUILDINGS[type].size;
  const blocked = blockedTiles(state, zone);
  const minR = type === 'turret' ? 6 : 4;
  for (let r = minR; r < map.size / 2; r++) {
    const steps = Math.max(8, Math.round(r * 5));
    for (let i = 0; i < steps; i++) {
      const a = (i / steps) * Math.PI * 2 + r;
      const tileX = Math.round(center.x + Math.cos(a) * r - size / 2);
      const tileY = Math.round(center.y + Math.sin(a) * r - size / 2);
      if (!hasMargin(blocked, map.size, tileX, tileY, size)) continue;
      if (!placementProblem(state, zone, type, tileX, tileY)) return { tileX, tileY };
    }
  }
  return null;
}
