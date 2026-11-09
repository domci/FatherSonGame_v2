import { BUILDINGS } from '../content/buildings';
import type { Entity, PlayerId } from './entity';
import { enemyOf } from './names';
import { hasResearch } from './research-helpers';
import type { GameState } from './state';

/** How far things see (tiles). */
export const SIGHT = { unit: 7, building: 4, turret: 9 } as const;

function sightOf(e: Entity): number {
  if (e.building) {
    const extra = e.attacker ? SIGHT.turret : SIGHT.building;
    return BUILDINGS[e.building.type].size / 2 + extra;
  }
  return SIGHT.unit;
}

/** Tiles that `owner` sees right now on one surface (1 = visible). Index: y * size + x. */
export function visibleTiles(state: GameState, owner: PlayerId, zone: string): Uint8Array {
  const map = state.surfaces[zone];
  const size = map?.size ?? 0;
  const out = new Uint8Array(size * size);
  for (const e of state.world.with('position')) {
    if (e.owner !== owner || e.zone !== zone || e.aboard) continue;
    const r = sightOf(e);
    const { x, y } = e.position;
    const y0 = Math.max(0, Math.floor(y - r));
    const y1 = Math.min(size - 1, Math.floor(y + r));
    for (let ty = y0; ty <= y1; ty++) {
      const dy = ty + 0.5 - y;
      const half = Math.sqrt(Math.max(0, r * r - dy * dy));
      const x0 = Math.max(0, Math.floor(x - half));
      const x1 = Math.min(size - 1, Math.floor(x + half));
      out.fill(1, ty * size + x0, ty * size + x1 + 1);
    }
  }
  return out;
}

/** Remembers which tiles were ever seen. Returns the explored tiles (1 = seen). */
export function explore(
  state: GameState,
  owner: PlayerId,
  zone: string,
  visible: Uint8Array,
): Uint8Array {
  const player = state.players[owner];
  const explored = new Uint8Array(visible.length);
  const old = player?.explored?.[zone] ?? '';
  let changed = old.length !== visible.length;
  for (let i = 0; i < visible.length; i++) {
    const was = old.charCodeAt(i) === 49;
    explored[i] = was || visible[i] ? 1 : 0;
    if (!was && visible[i]) changed = true;
  }
  if (player && changed) {
    player.explored = {
      ...player.explored,
      [zone]: String.fromCharCode(...explored.map((v) => 48 + v)),
    };
  }
  return explored;
}

/** Can `owner` see this thing? Own things and the wild nests are always known. */
export function canSee(visible: Uint8Array, size: number, e: Entity): boolean {
  if (!e.position) return false;
  const tx = Math.floor(e.position.x);
  const ty = Math.floor(e.position.y);
  return visible[ty * size + tx] === 1;
}

/** Updates the explored map of the human player on all surfaces where they have things. */
export function visibilitySystem(state: GameState): void {
  if (state.time % 500 >= 100) return;
  const zones = new Set<string>();
  for (const e of state.world.with('position'))
    if (e.owner === 'player' && e.zone && state.surfaces[e.zone]) zones.add(e.zone);
  for (const zone of zones) explore(state, 'player', zone, visibleTiles(state, 'player', zone));
}

/** The long-range radar shows the enemy home planet (its buildings) from far away. */
export function radarSees(state: GameState, owner: PlayerId, zone: string): boolean {
  const enemyHome = state.players[enemyOf(owner)]?.homeBodyId;
  return zone === enemyHome && hasResearch(state, owner, 'radar');
}

/**
 * May the player zoom down to this surface? Their own home always. Another planet only
 * with own units there (they see around them), or the enemy home with the radar.
 */
export function canViewSurface(state: GameState, owner: PlayerId, zone: string): boolean {
  if (!state.surfaces[zone]) return false;
  if (state.players[owner]?.homeBodyId === zone || radarSees(state, owner, zone)) return true;
  return state.world
    .with('position')
    .entities.some((e) => e.owner === owner && e.zone === zone && !e.aboard);
}
