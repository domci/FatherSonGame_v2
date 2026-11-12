import type { PlayerId, SideId } from './entity';
import { addEvent } from './game';
import { isSide, sidesOf } from './relations';
import type { GameEvent, GameState } from './state';

/**
 * A person plays this side. The first seat ('player') always counts as a person
 * (in balancing runs a computer plays it like a person). Online, every seat without
 * a computer brain is a person too.
 */
export function isHuman(state: GameState, id: PlayerId | undefined): id is SideId {
  if (!isSide(id) || !state.players[id]) return false;
  return id === 'player' || (isOnline(state) && !state.ai[id]);
}

/** All sides played by people (also beaten ones). */
export function humanSides(state: GameState): SideId[] {
  return sidesOf(state).filter((id) => isHuman(state, id));
}

/** Online world (M7)? */
export function isOnline(state: GameState): boolean {
  return state.settings.online === true;
}

/** The person is not here: the game is closed (catch-up), or online and not connected. */
export function isAway(state: GameState, id: PlayerId | undefined, offline: boolean): boolean {
  if (!isHuman(state, id)) return false;
  return offline || (isOnline(state) && !state.players[id]?.here);
}

/** One news line for the owner of something, if a person plays it. */
export function tell(
  state: GameState,
  owner: PlayerId | undefined,
  text: string,
  kind: GameEvent['kind'],
): void {
  if (isHuman(state, owner)) addEvent(state, text, kind, owner);
}

/** One news line for each person, from their own view (undefined = nothing for them). */
export function tellHumans(
  state: GameState,
  say: (viewer: SideId) => [string, GameEvent['kind']] | undefined,
): void {
  for (const id of humanSides(state)) {
    const line = say(id);
    if (line) addEvent(state, line[0], line[1], id);
  }
}
