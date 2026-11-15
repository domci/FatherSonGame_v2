import type { Difficulty } from '../content/ai';
import { ONLINE } from '../content/online';
import { AI_IDS, type SideId } from './entity';
import { createGame } from './game';
import { generateSurface } from './generation/surface';
import { humanSides, isHuman, isOnline, tellHumans } from './humans';
import { setRelation, sideIndex } from './relations';
import { addHomePlanet } from './generation/home-planets';
import { makePlayer, setupBase, setupNests } from './setup';
import type { Faction, GameState } from './state';
import { progressOf } from './ai/strength';
import { L, fmt, type Loc } from '../content/text';

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

/**
 * Seats for people that nobody has taken yet: first the places of the start, then planets
 * that were added later, then a new planet (while the world may still grow).
 */
export function freeSeats(state: GameState): SideId[] {
  if (!isOnline(state)) return [];
  const computers = state.settings.opponent ? state.settings.opponents : 0;
  const seats: SideId[] = AI_IDS.slice(computers, computers + (state.settings.humans ?? 0));
  const homes = state.system.homes.length;
  for (let i = 1 + computers + (state.settings.humans ?? 0); i < homes; i++) seats.push(`s${i}`);
  if (homes < ONLINE.maxGrownSides) seats.push(`s${homes}`);
  return seats.filter((id) => !state.players[id]);
}

/** Home planet of a seat (same order as the homes of the solar system). */
export function seatHome(state: GameState, seat: SideId): string | undefined {
  return state.system.homes[sideIndex(seat)];
}

/** The world grows: a new planet for a seat that has none yet. */
function growFor(state: GameState, seat: SideId): void {
  while (state.system.homes.length <= sideIndex(seat)) {
    addHomePlanet(state.system);
    state.settings.extraHomes = (state.settings.extraHomes ?? 0) + 1;
  }
}

/** People start in peace with each other (war needs a declaration, see shieldRule). */
export function makePeace(state: GameState, side: SideId): void {
  for (const other of humanSides(state))
    if (other !== side) setRelation(state, side, other, 'peace');
}

/** A person takes a free seat: a new base on its planet, with spiders and a beginner shield. */
export function seatPerson(state: GameState, seat: SideId, faction: Faction, name: string): void {
  growFor(state, seat);
  const zone = seatHome(state, seat);
  if (!zone) return;
  const map = (state.surfaces[zone] ??= generateSurface(state.seed, zone));
  const p = makePlayer(seat, faction, zone);
  state.players[seat] = { ...p, name, shieldUntil: state.time + ONLINE.shieldMs };
  setupBase(state, seat, map);
  if (!state.world.entities.some((e) => e.nest && e.zone === zone)) setupNests(state, map);
  makePeace(state, seat);
  tellHumans(state, (h) =>
    h === seat
      ? undefined
      : [
          fmt(L('{n} ist in eure Welt gekommen.', '{n} has come into your world.'), { n: name }),
          'info',
        ],
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
export function shieldRule(state: GameState, from: SideId, to: SideId): Loc | undefined {
  if (!isOnline(state) || !isHuman(state, from) || !isHuman(state, to)) return undefined;
  const target = state.players[to];
  const left = (target?.shieldUntil ?? 0) - state.time;
  const n = target?.name ?? to;
  if (left > 0)
    return fmt(
      L('{n} hat noch einen Anfänger-Schild ({h}).', '{n} still has a beginner shield ({h}).'),
      {
        n,
        h: hours(left),
      },
    );
  if (progressOf(state, to) < ONLINE.minStrength * progressOf(state, from))
    return fmt(
      L(
        '{n} ist viel schwächer als ihr. Sucht euch einen stärkeren Gegner.',
        '{n} is much weaker than you. Find a stronger opponent.',
      ),
      { n },
    );
  return undefined;
}

function hours(ms: number): Loc {
  const h = Math.ceil(ms / 3_600_000);
  if (h === 1) return L('noch 1 Stunde', '1 hour left');
  return fmt(L('noch {h} Stunden', '{h} hours left'), { h });
}
