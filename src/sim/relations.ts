import type { RelationKind } from '../content/sides';
import { AI_IDS, type PlayerId, type SideId } from './entity';
import type { GameState } from './state';

/** All sides that can play, in a fixed order: the player first, then the computers. */
export const SIDE_IDS: readonly SideId[] = ['player', ...AI_IDS];

export function isSide(id: PlayerId | undefined): id is SideId {
  return !!id && id !== 'wild';
}

/** Key of a pair of sides in state.relations (same for a-b and b-a). */
export function pairKey(a: SideId, b: SideId): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

/** How two owners stand to each other. The wild spiders are at war with everybody. */
export function relationOf(state: GameState, a: PlayerId, b: PlayerId): RelationKind | 'self' {
  if (a === b) return 'self';
  if (a === 'wild' || b === 'wild') return 'war';
  return state.relations[pairKey(a, b)]?.kind ?? 'war';
}

/** Do these owners fight each other? (Things without an owner never fight.) */
export function hostile(state: GameState, a?: PlayerId, b?: PlayerId): boolean {
  if (!a || !b || a === b) return false;
  return relationOf(state, a, b) === 'war';
}

/** Same side or allied: they share sight and win together. */
export function allied(state: GameState, a?: PlayerId, b?: PlayerId): boolean {
  if (!a || !b) return false;
  const r = relationOf(state, a, b);
  return r === 'self' || r === 'alliance';
}

export function setRelation(state: GameState, a: SideId, b: SideId, kind: RelationKind): void {
  if (a === b) return;
  state.relations[pairKey(a, b)] = { kind, since: state.time };
}

/** Game time of the last change between two sides (0 = never changed). */
export function relationSince(state: GameState, a: SideId, b: SideId): number {
  return state.relations[pairKey(a, b)]?.since ?? 0;
}

/** Sides in this game, in order. */
export function sidesOf(state: GameState): SideId[] {
  return SIDE_IDS.filter((id) => !!state.players[id]);
}

/** Sides that still play (not defeated). */
export function aliveSides(state: GameState): SideId[] {
  return sidesOf(state).filter((id) => !state.players[id]?.defeated);
}

/** Sides that still play and are at war with this one. */
export function hostileSides(state: GameState, side: PlayerId): SideId[] {
  return aliveSides(state).filter((id) => hostile(state, side, id));
}

/** Sides that still play and are allied with this one (not itself). */
export function alliesOf(state: GameState, side: SideId): SideId[] {
  return aliveSides(state).filter((id) => id !== side && allied(state, side, id));
}

/** The side whose home planet this is (also defeated ones), if any. */
export function homeOwner(state: GameState, bodyId: string): SideId | undefined {
  return sidesOf(state).find((id) => state.players[id]?.homeBodyId === bodyId);
}
