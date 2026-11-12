import { viewerOf } from '../sim/viewer';
import type { Session } from '../app/session';
import { FACTIONS } from '../content/factions';
import { RELATION_COLORS, RELATION_NAMES } from '../content/sides';
import { militaryPower } from '../sim/ai/strength';
import { offerFrom, whyNot, type DiplomacyAction } from '../sim/diplomacy';
import type { PlayerId, SideId } from '../sim/entity';
import { relationOf, sidesOf } from '../sim/relations';
import type { GameState, PlayerState } from '../sim/state';
import { el } from './dom';
import type { IconName } from './icons';
import { action, header, text } from './panel-kit';

/** How strong a side is compared to the player. */
export function strengthWord(state: GameState, side: SideId): string {
  const mine = Math.max(1, militaryPower(state, viewerOf(state)));
  const ratio = militaryPower(state, side) / mine;
  if (ratio < 0.67) return 'schwächer als ihr';
  return ratio > 1.5 ? 'stärker als ihr' : 'etwa so stark wie ihr';
}

/** Name and color of the relation to the player ("Besiegt" for sides that are out). */
export function relationLabel(state: GameState, side: SideId): { name: string; color: string } {
  if (state.players[side]?.defeated) return { name: 'Besiegt', color: '#7d8798' };
  const r = relationOf(state, viewerOf(state), side);
  if (r === 'self') return { name: 'Ihr', color: RELATION_COLORS.self };
  return { name: RELATION_NAMES[r], color: RELATION_COLORS[r] };
}

/** "Feind: Schwarm Xar", "Verbündet: …", "Frieden: …" (or `own` for the player's things). */
export function ownerLabel(state: GameState, owner: PlayerId | undefined, own: string): string {
  if (owner === 'wild') return 'Wildes Tier';
  if (!owner || owner === viewerOf(state)) return own;
  const name = state.players[owner]?.name ?? 'Feind';
  const r = relationOf(state, viewerOf(state), owner);
  if (r === 'war') return `Feind: ${name}`;
  return r === 'alliance' ? `Verbündet: ${name}` : `Frieden: ${name}`;
}

const BUTTONS: Record<DiplomacyAction, { icon: IconName; label: string }> = {
  peace: { icon: 'handshake', label: 'Frieden anbieten' },
  alliance: { icon: 'shield-check', label: 'Bündnis anbieten' },
  war: { icon: 'swords', label: 'Krieg erklären' },
  endAlliance: { icon: 'x', label: 'Bündnis beenden' },
  decline: { icon: 'x', label: 'Ablehnen' },
};

function actionsFor(state: GameState, side: SideId): DiplomacyAction[] {
  const r = relationOf(state, viewerOf(state), side);
  if (r === 'war') return ['peace'];
  return r === 'peace' ? ['alliance', 'war'] : ['endAlliance'];
}

function button(session: Session, side: SideId, a: DiplomacyAction, label?: string): HTMLElement {
  const b = BUTTONS[a];
  const send = (): boolean =>
    session.command({ type: 'diplomacy', player: session.me, side, action: a });
  return action(b.icon, label ?? b.label, { onclick: () => void send() });
}

/** "Krieg mit Brut der Zyl · Frieden mit Nest Krah": how a side stands with the others. */
function othersLine(state: GameState, p: PlayerState): string {
  const parts = sidesOf(state)
    .filter((id) => id !== viewerOf(state) && id !== p.id && !state.players[id]?.defeated)
    .map((id) => {
      const r = relationOf(state, p.id, id);
      const what = r === 'war' ? 'Krieg' : r === 'peace' ? 'Frieden' : 'Bündnis';
      return `${what} mit ${state.players[id]?.name ?? id}`;
    });
  return parts.join(' · ');
}

function offerBox(session: Session, p: PlayerState): HTMLElement | null {
  const offer = offerFrom(session.state, p.id, viewerOf(session.state));
  if (!offer) return null;
  const what = offer.kind === 'peace' ? 'Frieden' : 'ein Bündnis';
  return el(
    'div',
    { class: 'offer-box' },
    text(`${p.name} bietet euch ${what} an!`, 'p-text good'),
    button(session, p.id, offer.kind, 'Annehmen'),
    button(session, p.id, 'decline'),
  );
}

function sideCard(session: Session, p: PlayerState): HTMLElement {
  const s = session.state;
  const rel = relationLabel(s, p.id);
  const out = p.defeated;
  const hint = out ? '' : actionsFor(s, p.id).map((a) => whyNot(s, viewerOf(s), p.id, a))[0];
  return el(
    'div',
    { class: 'side-card', 'data-side': p.id, style: `--side: ${p.color}` },
    el(
      'div',
      { class: 'side-top' },
      el('span', { class: 'side-dot' }),
      el('b', { class: 'side-name' }, p.name),
      el('span', { class: 'side-rel', style: `--rel: ${rel.color}` }, rel.name),
    ),
    text(
      `${FACTIONS[p.faction].name} · ${out ? 'aus dem Spiel' : strengthWord(s, p.id)}`,
      'p-text muted',
    ),
    out ? null : text(othersLine(s, p), 'p-text small'),
    out ? null : offerBox(session, p),
    ...(out ? [] : actionsFor(s, p.id).map((a) => button(session, p.id, a))),
    hint ? text(hint, 'p-text muted small') : null,
  );
}

/** The peoples window: every other side, how you stand, and peace, alliance or war. */
export function peoplesPanel(session: Session): HTMLElement[] {
  const s = session.state;
  const others = sidesOf(s)
    .filter((id) => id !== session.me)
    .map((id) => s.players[id])
    .filter((p): p is PlayerState => !!p);
  return [
    header('Völker', 'Diplomatie'),
    text(
      'Krieg: ihr kämpft. Frieden: keiner greift an. Bündnis: ihr seht alles zusammen und gewinnt zusammen.',
      'p-text muted',
    ),
    ...others.map((p) => sideCard(session, p)),
  ];
}

/** Changes when the peoples window must be rebuilt. */
export function peoplesKey(session: Session): string {
  const s = session.state;
  const hints = sidesOf(s).map((id) =>
    id === session.me
      ? ''
      : actionsFor(s, id)
          .map((a) => whyNot(s, viewerOf(s), id, a))
          .join(),
  );
  const strength = sidesOf(s).map((id) => strengthWord(s, id));
  const out = sidesOf(s).map((id) => (s.players[id]?.defeated ? 1 : 0));
  return `peoples:${JSON.stringify([s.relations, s.offers, hints, strength, out])}`;
}
