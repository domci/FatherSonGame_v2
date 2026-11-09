import { BUILDINGS, type BuildingId } from '../content/buildings';
import type { Entity, PlayerId } from './entity';
import type { GameState } from './state';

/**
 * Nobody can breathe outside: all buildings are joined by airtight tunnels.
 * A new building must be at most this many tiles (edge to edge) from an own building.
 */
export const TUNNEL_REACH = 9;

/** Walls, force fields and turrets stand alone (no crew inside). */
const ALONE: ReadonlySet<BuildingId> = new Set(['wall', 'forceField', 'turret']);

export function needsTunnel(type: BuildingId): boolean {
  return !ALONE.has(type);
}

interface Box {
  x: number;
  y: number;
  size: number;
}

/** Tiles between two squares (0 = they touch). */
export function gapBetween(a: Box, b: Box): number {
  const dx = Math.max(0, a.x - (b.x + b.size), b.x - (a.x + a.size));
  const dy = Math.max(0, a.y - (b.y + b.size), b.y - (a.y + a.size));
  return Math.hypot(dx, dy);
}

export function boxOf(e: Entity): Box | undefined {
  if (!e.building) return undefined;
  const { tileX, tileY, type } = e.building;
  return { x: tileX, y: tileY, size: BUILDINGS[type].size };
}

/** Own buildings on this surface that are part of the tunnel network. */
export function networkBuildings(state: GameState, owner: PlayerId, zone: string): Entity[] {
  return state.world
    .with('building')
    .entities.filter((e) => e.owner === owner && e.zone === zone && needsTunnel(e.building.type));
}

/** Is a new building here close enough to join the tunnel network? */
export function tunnelReaches(
  state: GameState,
  owner: PlayerId,
  zone: string,
  type: BuildingId,
  tileX: number,
  tileY: number,
): boolean {
  if (!needsTunnel(type)) return true;
  const box = { x: tileX, y: tileY, size: BUILDINGS[type].size };
  return networkBuildings(state, owner, zone).some((b) => {
    const other = boxOf(b);
    return !!other && gapBetween(box, other) <= TUNNEL_REACH;
  });
}
