import { L, fmt, same, type Loc } from '../content/text';
import { DIPLOMACY, type RelationKind } from '../content/sides';
import { checkVictory } from './defeat';
import type { SideId } from './entity';
import { isOnline, tell, tellHumans } from './humans';
import { shieldRule } from './online';
import { relationOf, relationSince, setRelation } from './relations';
import type { GameEvent, GameState, Offer } from './state';

/** What one side can do towards another. Peace and alliance are offers. */
export type DiplomacyAction = 'peace' | 'alliance' | 'war' | 'endAlliance' | 'decline';

function minutesLeft(ms: number): Loc {
  const m = Math.max(1, Math.ceil(ms / 60_000));
  return m === 1 ? L('1 Minute', '1 minute') : fmt(L('{m} Minuten', '{m} minutes'), { m });
}

function waitFor(state: GameState, a: SideId, b: SideId, ms: number): number {
  return relationSince(state, a, b) + ms - state.time;
}

function offerRule(
  state: GameState,
  from: SideId,
  to: SideId,
  kind: Offer['kind'],
): Loc | undefined {
  const now = relationOf(state, from, to);
  if (kind === 'peace') {
    if (now !== 'war') return L('Es ist schon Frieden.', 'There is already peace.');
    const left = waitFor(state, from, to, DIPLOMACY.warCooldownMs);
    if (left <= 0) return undefined;
    return fmt(L('Frieden ist erst in {t} möglich.', 'Peace is only possible in {t}.'), {
      t: minutesLeft(left),
    });
  }
  if (now === 'war')
    return L('Erst Frieden schließen, dann ein Bündnis.', 'Make peace first, then an alliance.');
  if (now === 'alliance') return L('Ihr seid schon verbündet.', 'You are already allies.');
  const left = waitFor(state, from, to, DIPLOMACY.allianceAfterMs);
  if (left <= 0) return undefined;
  return fmt(L('Ein Bündnis ist erst in {t} möglich.', 'An alliance is only possible in {t}.'), {
    t: minutesLeft(left),
  });
}

/** Why `from` may not do this towards `to` now. undefined = allowed. */
export function whyNot(
  state: GameState,
  from: SideId,
  to: SideId,
  action: DiplomacyAction,
): Loc | undefined {
  const a = state.players[from];
  const b = state.players[to];
  if (!a || !b || from === to) return L('Unbekanntes Volk.', 'Unknown people.');
  if (a.defeated || b.defeated)
    return fmt(L('{n} ist besiegt.', '{n} is defeated.'), { n: b.defeated ? b.name : a.name });
  if (action === 'decline')
    return offerFrom(state, to, from)
      ? undefined
      : L('Es gibt kein Angebot.', 'There is no offer.');
  if (action === 'peace' || action === 'alliance') return offerRule(state, from, to, action);
  return breakRule(state, [from, to], action);
}

/** War only from peace (an alliance must end first). Online: not on weak or new people. */
function breakRule(
  state: GameState,
  [from, to]: [SideId, SideId],
  action: 'war' | 'endAlliance',
): Loc | undefined {
  const now = relationOf(state, from, to);
  if (action === 'endAlliance')
    return now === 'alliance' ? undefined : L('Es gibt kein Bündnis.', 'There is no alliance.');
  if (now === 'peace') return shieldRule(state, from, to);
  return now === 'war'
    ? L('Es ist schon Krieg.', 'There is already war.')
    : L('Erst das Bündnis beenden.', 'End the alliance first.');
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
  const wait = isOnline(state) ? DIPLOMACY.onlineOfferMs : DIPLOMACY.offerMs;
  state.offers.push({ from, to, kind, until: state.time + wait });
  const name = state.players[from]?.name ?? from;
  const text =
    kind === 'peace'
      ? L(
          '{n} bietet euch Frieden an. Antwortet im Völker-Fenster.',
          '{n} offers you peace. Answer in the peoples window.',
        )
      : L(
          '{n} bietet euch ein Bündnis an. Antwortet im Völker-Fenster.',
          '{n} offers you an alliance. Answer in the peoples window.',
        );
  tell(state, to, fmt(text, { n: name }), 'info');
}

export function removeOffers(state: GameState, a: SideId, b: SideId): void {
  state.offers = state.offers.filter(
    (o) => !((o.from === a && o.to === b) || (o.from === b && o.to === a)),
  );
}

/** The news of a new relation, as one person (viewer) sees it. */
function eventText(
  state: GameState,
  viewer: SideId,
  [by, other]: [SideId, SideId],
  kind: RelationKind,
): Loc {
  const n = (id: SideId): string => state.players[id]?.name ?? id;
  const you = by === viewer ? other : other === viewer ? by : undefined;
  const v = { a: n(by), b: n(other), y: you ? n(you) : '' };
  if (kind === 'war') {
    if (by === viewer) return fmt(L('Ihr erklärt {b} den Krieg!', 'You declare war on {b}!'), v);
    if (other === viewer)
      return fmt(L('{a} erklärt euch den Krieg!', '{a} declares war on you!'), v);
    return fmt(L('{a} erklärt {b} den Krieg.', '{a} declares war on {b}.'), v);
  }
  if (you)
    return kind === 'peace'
      ? fmt(L('Frieden mit {y}!', 'Peace with {y}!'), v)
      : fmt(L('Bündnis mit {y}!', 'Alliance with {y}!'), v);
  return kind === 'peace'
    ? fmt(L('{a} und {b} schließen Frieden.', '{a} and {b} make peace.'), v)
    : fmt(L('{a} und {b} sind jetzt verbündet.', '{a} and {b} are allies now.'), v);
}

function eventKind(
  viewer: SideId,
  by: SideId,
  other: SideId,
  kind: RelationKind,
): GameEvent['kind'] {
  if (by !== viewer && other !== viewer) return 'info';
  if (kind === 'war') return other === viewer ? 'bad' : 'info';
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
  tellHumans(state, (h) => [eventText(state, h, [by, other], kind), eventKind(h, by, other, kind)]);
  checkVictory(state);
}

/** An alliance ends: back to peace. */
export function endAlliance(state: GameState, by: SideId, other: SideId): void {
  setRelation(state, by, other, 'peace');
  removeOffers(state, by, other);
  tellHumans(state, (h) => {
    const name = (id: SideId): Loc =>
      id === h ? L('Ihr', 'You') : same(state.players[id]?.name ?? id);
    const text = fmt(
      L(
        '{a} beendet das Bündnis mit {b}. Jetzt ist Frieden.',
        '{a} end(s) the alliance with {b}. Now there is peace.',
      ),
      { a: name(by), b: name(other) },
    );
    return [text, other === h ? 'bad' : 'info'];
  });
}

/** Offers that waited too long are gone. */
export function diplomacySystem(state: GameState): void {
  if (state.offers.some((o) => o.until <= state.time))
    state.offers = state.offers.filter((o) => o.until > state.time);
}
