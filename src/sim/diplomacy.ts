import { DIPLOMACY, type RelationKind } from '../content/sides';
import { checkVictory } from './defeat';
import type { SideId } from './entity';
import { addEvent } from './game';
import { relationOf, relationSince, setRelation } from './relations';
import type { GameEvent, GameState, Offer } from './state';

/** What one side can do towards another. Peace and alliance are offers. */
export type DiplomacyAction = 'peace' | 'alliance' | 'war' | 'endAlliance' | 'decline';

function minutesLeft(ms: number): string {
  const m = Math.max(1, Math.ceil(ms / 60_000));
  return m === 1 ? '1 Minute' : `${m} Minuten`;
}

function waitFor(state: GameState, a: SideId, b: SideId, ms: number): number {
  return relationSince(state, a, b) + ms - state.time;
}

function offerRule(state: GameState, from: SideId, to: SideId, kind: Offer['kind']): string {
  const now = relationOf(state, from, to);
  if (kind === 'peace') {
    if (now !== 'war') return 'Es ist schon Frieden.';
    const left = waitFor(state, from, to, DIPLOMACY.warCooldownMs);
    return left > 0 ? `Frieden ist erst in ${minutesLeft(left)} möglich.` : '';
  }
  if (now === 'war') return 'Erst Frieden schließen, dann ein Bündnis.';
  if (now === 'alliance') return 'Ihr seid schon verbündet.';
  const left = waitFor(state, from, to, DIPLOMACY.allianceAfterMs);
  return left > 0 ? `Ein Bündnis ist erst in ${minutesLeft(left)} möglich.` : '';
}

/** Why `from` may not do this towards `to` now. Empty text = allowed. */
export function whyNot(
  state: GameState,
  from: SideId,
  to: SideId,
  action: DiplomacyAction,
): string {
  const a = state.players[from];
  const b = state.players[to];
  if (!a || !b || from === to) return 'Unbekanntes Volk.';
  if (a.defeated || b.defeated) return `${b.defeated ? b.name : a.name} ist besiegt.`;
  if (action === 'decline') return offerFrom(state, to, from) ? '' : 'Es gibt kein Angebot.';
  if (action === 'peace' || action === 'alliance') return offerRule(state, from, to, action);
  return breakRule(relationOf(state, from, to), action);
}

/** War only from peace (an alliance must end first). */
function breakRule(now: RelationKind | 'self', action: 'war' | 'endAlliance'): string {
  if (action === 'endAlliance') return now === 'alliance' ? '' : 'Es gibt kein Bündnis.';
  if (now === 'peace') return '';
  return now === 'war' ? 'Es ist schon Krieg.' : 'Erst das Bündnis beenden.';
}

/** An open offer from one side to another (of one kind, or any). */
export function offerFrom(
  state: GameState,
  from: SideId,
  to: SideId,
  kind?: Offer['kind'],
): Offer | undefined {
  return state.offers.find((o) => o.from === from && o.to === to && (!kind || o.kind === kind));
}

export function addOffer(state: GameState, from: SideId, to: SideId, kind: Offer['kind']): void {
  if (offerFrom(state, from, to, kind)) return;
  state.offers.push({ from, to, kind, until: state.time + DIPLOMACY.offerMs });
  const name = state.players[from]?.name ?? from;
  const what = kind === 'peace' ? 'Frieden' : 'ein Bündnis';
  addEvent(state, `${name} bietet euch ${what} an. Antwortet im Völker-Fenster.`, 'info');
}

export function removeOffers(state: GameState, a: SideId, b: SideId): void {
  state.offers = state.offers.filter(
    (o) => !((o.from === a && o.to === b) || (o.from === b && o.to === a)),
  );
}

function eventText(state: GameState, by: SideId, other: SideId, kind: RelationKind): string {
  const name = (id: SideId): string => state.players[id]?.name ?? id;
  const you = by === 'player' ? other : other === 'player' ? by : undefined;
  if (kind === 'war') {
    if (by === 'player') return `Ihr erklärt ${name(other)} den Krieg!`;
    if (other === 'player') return `${name(by)} erklärt euch den Krieg!`;
    return `${name(by)} erklärt ${name(other)} den Krieg.`;
  }
  const what = kind === 'peace' ? 'Frieden' : 'Bündnis';
  if (you) return `${what} mit ${name(you)}!`;
  return kind === 'peace'
    ? `${name(by)} und ${name(other)} schließen Frieden.`
    : `${name(by)} und ${name(other)} sind jetzt verbündet.`;
}

function eventKind(by: SideId, other: SideId, kind: RelationKind): GameEvent['kind'] {
  if (by !== 'player' && other !== 'player') return 'info';
  if (kind === 'war') return other === 'player' ? 'bad' : 'info';
  return 'good';
}

/** Sets a new relation, drops open offers between the two and tells the player. */
export function changeRelation(
  state: GameState,
  by: SideId,
  other: SideId,
  kind: RelationKind,
): void {
  setRelation(state, by, other, kind);
  removeOffers(state, by, other);
  addEvent(state, eventText(state, by, other, kind), eventKind(by, other, kind));
  checkVictory(state);
}

/** An alliance ends: back to peace. */
export function endAlliance(state: GameState, by: SideId, other: SideId): void {
  setRelation(state, by, other, 'peace');
  removeOffers(state, by, other);
  const name = (id: SideId): string => (id === 'player' ? 'Ihr' : (state.players[id]?.name ?? id));
  const kind = other === 'player' ? 'bad' : 'info';
  addEvent(state, `${name(by)} beendet das Bündnis mit ${name(other)}. Jetzt ist Frieden.`, kind);
}

/** Offers that waited too long are gone. */
export function diplomacySystem(state: GameState): void {
  if (state.offers.some((o) => o.until <= state.time))
    state.offers = state.offers.filter((o) => o.until > state.time);
}
