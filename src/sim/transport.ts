import type { Entity, Vec2 } from './entity';
import { nextRandom } from './game';
import { bodyPosition, findBody } from './generation/solar-system';
import { blockedTiles } from './occupancy';
import { SECOND } from './clock';
import type { GameState } from './state';
import { formation } from './commands/units';

/** Flight time between two planets (measured at the start). */
export function flightMs(state: GameState, fromId: string, toId: string): number {
  const a = findBody(state.system, fromId);
  const b = findBody(state.system, toId);
  if (!a || !b) return 60 * SECOND;
  const pa = bodyPosition(a, state.time);
  const pb = bodyPosition(b, state.time);
  return Math.round(Math.hypot(pa.x - pb.x, pa.y - pb.y) * 4 * SECOND);
}

function coreOf(state: GameState, zone: string): Entity | undefined {
  return state.world
    .with('building')
    .entities.find((b) => b.zone === zone && b.building.type === 'commandDome');
}

function isOpen(blocked: boolean[], size: number, x: number, y: number): boolean {
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++) {
      const tx = Math.floor(x) + dx;
      const ty = Math.floor(y) + dy;
      if (tx < 0 || ty < 0 || tx >= size || ty >= size || blocked[ty * size + tx]) return false;
    }
  return true;
}

/**
 * Where a ship lands: at home next to the main building,
 * on an enemy planet some distance away from the enemy base.
 */
export function landingSpot(state: GameState, ship: Entity, zone: string): Vec2 {
  const map = state.surfaces[zone];
  if (!map) return { x: 0, y: 0 };
  const core = coreOf(state, zone);
  const center = core?.position ?? { x: map.size / 2, y: map.size / 2 };
  const home = core?.owner === ship.owner;
  const blocked = blockedTiles(state, zone);
  const start = nextRandom(state) * Math.PI * 2;
  for (let r = home ? 4 : 17; r > 2; r -= 0.5) {
    for (let i = 0; i < 16; i++) {
      const a = start + (i / 16) * Math.PI * 2;
      const x = center.x + Math.cos(a) * r;
      const y = center.y + Math.sin(a) * r;
      if (isOpen(blocked, map.size, x, y)) return { x, y };
    }
    if (home) r += 1.5;
    if (r > map.size) break;
  }
  return { x: 2, y: 2 };
}

/** Puts all passengers of a ship on the ground around it. */
export function unloadShip(state: GameState, ship: Entity): number {
  const pos = ship.position;
  if (!pos || !ship.zone) return 0;
  const riders = state.world.with('aboard').entities.filter((u) => u.aboard.shipId === ship.id);
  const spots = formation({ x: pos.x, y: pos.y + 1.6 }, riders.length, 1);
  riders.forEach((u, i) => {
    u.zone = ship.zone;
    u.position = { ...(spots[i] ?? pos) };
    state.world.removeComponent(u, 'aboard');
  });
  return riders.length;
}

export function passengers(state: GameState, shipId: number): Entity[] {
  return state.world.with('aboard').entities.filter((u) => u.aboard.shipId === shipId);
}
