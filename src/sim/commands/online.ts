import { ONLINE } from '../../content/online';
import type { PlayerId, SideId } from '../entity';
import { tellHumans } from '../humans';
import { clearSide, freeSeats, makePeace, seatHome, seatPerson } from '../online';
import { isSide } from '../relations';
import { makePlayer, setupBase } from '../setup';
import type { Faction, GameState } from '../state';
import { fail, OK, type CommandResult } from './result';

/** Server only: a person takes a free seat of an online world. */
export interface JoinCommand {
  type: 'join';
  player: PlayerId;
  faction: Faction;
  name: string;
}

/** Server only: a person connects or goes away. */
export interface PresenceCommand {
  type: 'presence';
  player: PlayerId;
  here: boolean;
}

/** Server only: a person leaves the world for good (the seat is free again). */
export interface LeaveCommand {
  type: 'leave';
  player: PlayerId;
}

/** A beaten person starts again on the same planet (online). */
export interface RestartCommand {
  type: 'restart';
  player: PlayerId;
}

export function join(state: GameState, cmd: JoinCommand): CommandResult {
  if (!isSide(cmd.player) || !freeSeats(state).includes(cmd.player))
    return fail('Dieser Platz ist nicht frei.');
  seatPerson(state, cmd.player, cmd.faction, cmd.name);
  return OK;
}

export function presence(state: GameState, cmd: PresenceCommand): CommandResult {
  const p = state.players[cmd.player];
  if (!p) return fail('Unbekannter Spieler.');
  p.here = cmd.here;
  return OK;
}

export function leave(state: GameState, cmd: LeaveCommand): CommandResult {
  const side = cmd.player;
  const p = isSide(side) ? state.players[side] : undefined;
  if (!p || !isSide(side) || side === 'player') return fail('Dieser Platz kann nicht frei werden.');
  clearSide(state, side);
  state.players = Object.fromEntries(
    Object.entries(state.players).filter(([id]) => id !== side),
  ) as GameState['players'];
  tellHumans(state, () => [`${p.name} hat eure Welt verlassen.`, 'info']);
  return OK;
}

/** Same seat, name and color; a new base and a new beginner shield. */
function startAgain(state: GameState, side: SideId, faction: Faction): void {
  const old = state.players[side];
  const zone = seatHome(state, side);
  const map = zone ? state.surfaces[zone] : undefined;
  if (!old || !zone || !map) return;
  clearSide(state, side);
  const fresh = makePlayer(side, faction, zone);
  state.players[side] = {
    ...fresh,
    name: old.name,
    color: old.color,
    here: old.here,
    shieldUntil: state.time + ONLINE.shieldMs,
  };
  setupBase(state, side, map);
  makePeace(state, side);
}

export function restart(state: GameState, cmd: RestartCommand): CommandResult {
  const p = isSide(cmd.player) ? state.players[cmd.player] : undefined;
  if (!state.settings.online || !p || !isSide(cmd.player)) return fail('Nur in Online-Welten.');
  if (!p.defeated) return fail('Ihr seid noch nicht besiegt.');
  startAgain(state, cmd.player, p.faction);
  return OK;
}
