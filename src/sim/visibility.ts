import { BUILDINGS } from '../content/buildings';
import type { Entity, PlayerId, SideId } from './entity';
import { humanSides } from './humans';
import { allied, sidesOf } from './relations';
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

/** The owner and its allies: they share what they see. */
export function friendsOf(state: GameState, owner: PlayerId): Set<PlayerId> {
  const out = new Set<PlayerId>([owner]);
  for (const id of sidesOf(state)) if (allied(state, owner, id)) out.add(id);
  return out;
}

/** Tiles that `owner` (and its allies) see right now on one surface. Index: y * size + x. */
export function visibleTiles(state: GameState, owner: PlayerId, zone: string): Uint8Array {
  const map = state.surfaces[zone];
  const size = map?.size ?? 0;
  const out = new Uint8Array(size * size);
  const friends = friendsOf(state, owner);
  for (const e of state.world.with('position')) {
    if (!e.owner || !friends.has(e.owner) || e.zone !== zone || e.aboard) continue;
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

/** Updates the explored map of one person on all surfaces where they or allies have things. */
function exploreFor(state: GameState, side: SideId): void {
  const zones = new Set<string>();
  const friends = friendsOf(state, side);
  for (const e of state.world.with('position'))
    if (e.owner && friends.has(e.owner) && e.zone && state.surfaces[e.zone]) zones.add(e.zone);
  for (const zone of zones) explore(state, side, zone, visibleTiles(state, side, zone));
}

/** Updates the explored maps of all people (computers see everything). */
export function visibilitySystem(state: GameState): void {
  if (state.time % 500 >= 100) return;
  for (const side of humanSides(state)) if (!state.players[side]?.defeated) exploreFor(state, side);
}

/** Is this the home planet of another side? */
export function isForeignHome(state: GameState, owner: PlayerId, zone: string): boolean {
  return sidesOf(state).some((id) => id !== owner && state.players[id]?.homeBodyId === zone);
}

/** The long-range radar shows the home planets of the other sides (their buildings) from far away. */
export function radarSees(state: GameState, owner: PlayerId, zone: string): boolean {
  return hasResearch(state, owner, 'radar') && isForeignHome(state, owner, zone);
}

/** Does `owner` know the base on this planet (another side's home)? With the radar, or as an ally. */
export function knowsBase(state: GameState, owner: PlayerId, zone: string): boolean {
  const side = sidesOf(state).find((id) => id !== owner && state.players[id]?.homeBodyId === zone);
  if (!side || state.players[side]?.defeated) return false;
  return allied(state, owner, side) || hasResearch(state, owner, 'radar');
}

/**
 * May the player zoom down to this surface? Their own home and allied homes always. Another
 * planet only with own or allied units there (they see around them), or a foreign home with the radar.
 */
export function canViewSurface(state: GameState, owner: PlayerId, zone: string): boolean {
  if (!state.surfaces[zone]) return false;
  if (radarSees(state, owner, zone)) return true;
  const friends = friendsOf(state, owner);
  for (const id of friends) if (state.players[id]?.homeBodyId === zone) return true;
  return state.world
    .with('position')
    .entities.some((e) => !!e.owner && friends.has(e.owner) && e.zone === zone && !e.aboard);
}
