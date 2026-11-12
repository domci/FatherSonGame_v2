import type { Difficulty } from '../content/ai';
import { ONLINE } from '../content/online';
import { AI_IDS, type SideId } from './entity';
import { createGame } from './game';
import { generateSurface } from './generation/surface';
import { humanSides, isHuman, isOnline, tellHumans } from './humans';
import { setRelation, SIDE_IDS } from './relations';
import { makePlayer, setupBase, setupNests } from './setup';
import type { Faction, GameState } from './state';
import { progressOf } from './ai/strength';

export interface OnlineWorldOptions {
  seed: number;
  /** Real time of the start (online, game time = real time). */
  time: number;
  /** People and name of the person who makes the world (seat 'player'). */
  faction: Faction;
  name: string;
  difficulty: Difficulty;
  /** Computer sides, 0..3. */
  computers: number;
  /** Places for people, 1..4 (with the maker). */
  people: number;
  offlineAttacks?: boolean;
}

/** Commands only the server may give (people joining and leaving). */
export const SERVER_COMMANDS: readonly string[] = ['join', 'presence', 'leave'];

/** A new online world. Seats: the maker, then the computers, then the free places for people. */
export function createOnlineWorld(o: OnlineWorldOptions): GameState {
  const computers = Math.max(0, Math.min(AI_IDS.length, o.computers));
  const people = Math.max(1, Math.min(ONLINE.maxSides - computers, o.people));
  const state = createGame({
    seed: o.seed,
    time: o.time,
    faction: o.faction,
    difficulty: o.difficulty,
    offlineAttacks: o.offlineAttacks ?? false,
    opponent: computers > 0,
    opponents: computers,
    online: { humans: people - 1 },
  });
  const me = state.players.player;
  if (me) {
    me.name = o.name;
    me.shieldUntil = o.time + ONLINE.shieldMs;
  }
  return state;
}

/** Seats for people that nobody has taken yet. */
export function freeSeats(state: GameState): SideId[] {
  if (!isOnline(state)) return [];
  const computers = state.settings.opponent ? state.settings.opponents : 0;
  const seats = AI_IDS.slice(computers, computers + (state.settings.humans ?? 0));
  return seats.filter((id) => !state.players[id]);
}

/** Home planet of a seat (same order as the homes of the solar system). */
export function seatHome(state: GameState, seat: SideId): string | undefined {
  return state.system.homes[SIDE_IDS.indexOf(seat)];
}

/** People start in peace with each other (war needs a declaration, see shieldRule). */
export function makePeace(state: GameState, side: SideId): void {
  for (const other of humanSides(state))
    if (other !== side) setRelation(state, side, other, 'peace');
}

/** A person takes a free seat: a new base on its planet, with spiders and a beginner shield. */
export function seatPerson(state: GameState, seat: SideId, faction: Faction, name: string): void {
  const zone = seatHome(state, seat);
  if (!zone) return;
  const map = (state.surfaces[zone] ??= generateSurface(state.seed, zone));
  const p = makePlayer(seat, faction, zone);
  state.players[seat] = { ...p, name, shieldUntil: state.time + ONLINE.shieldMs };
  setupBase(state, seat, map);
  if (!state.world.entities.some((e) => e.nest && e.zone === zone)) setupNests(state, map);
  makePeace(state, seat);
  tellHumans(state, (h) =>
    h === seat ? undefined : [`${name} ist in eure Welt gekommen.`, 'info'],
  );
}

/** Removes everything of a side and its relations (it left the world, or starts again). */
export function clearSide(state: GameState, side: SideId): void {
  for (const e of state.world.entities.filter((x) => x.owner === side)) state.world.remove(e);
  state.relations = Object.fromEntries(
    Object.entries(state.relations).filter(([key]) => !key.split('|').includes(side)),
  );
  state.offers = state.offers.filter((o) => o.from !== side && o.to !== side);
}

/** Why `from` may not declare war on `to` (online, person against person). Empty = allowed. */
export function shieldRule(state: GameState, from: SideId, to: SideId): string {
  if (!isOnline(state) || !isHuman(state, from) || !isHuman(state, to)) return '';
  const target = state.players[to];
  const left = (target?.shieldUntil ?? 0) - state.time;
  if (left > 0) return `${target?.name ?? to} hat noch einen Anfänger-Schild (${hours(left)}).`;
  if (progressOf(state, to) < ONLINE.minStrength * progressOf(state, from))
    return `${target?.name ?? to} ist viel schwächer als ihr. Sucht euch einen stärkeren Gegner.`;
  return '';
}

function hours(ms: number): string {
  const h = Math.ceil(ms / 3_600_000);
  return h === 1 ? 'noch 1 Stunde' : `noch ${h} Stunden`;
}
