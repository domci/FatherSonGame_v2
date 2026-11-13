import type { SideId } from './entity';
import type { GameState } from './state';

const viewers = new WeakMap<GameState, SideId>();

/**
 * The side this device plays and shows: 'player' on this device, any seat online (M7).
 * Not a game rule and not saved: menus, pictures and input use it ("me").
 */
export function viewerOf(state: GameState): SideId {
  return viewers.get(state) ?? 'player';
}

export function setViewer(state: GameState, side: SideId): void {
  viewers.set(state, side);
}

/** Home planet of the side this device plays. */
export function viewerHome(state: GameState): string {
  return state.players[viewerOf(state)]?.homeBodyId ?? state.system.homeBodyId;
}
