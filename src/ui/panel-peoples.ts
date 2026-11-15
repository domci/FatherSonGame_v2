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
import { t, tx } from '../i18n';

/** How strong a side is compared to the player. */
export function strengthWord(state: GameState, side: SideId): string {
  const mine = Math.max(1, militaryPower(state, viewerOf(state)));
  const ratio = militaryPower(state, side) / mine;
  if (ratio < 0.67) return t('weaker');
  return ratio > 1.5 ? t('stronger') : t('asStrong');
}

/** Name and color of the relation to the player (t('defeated') for sides that are out). */
export function relationLabel(state: GameState, side: SideId): { name: string; color: string } {
  if (state.players[side]?.defeated) return { name: t('defeated'), color: '#7d8798' };
  const r = relationOf(state, viewerOf(state), side);
  if (r === 'self') return { name: t('you'), color: RELATION_COLORS.self };
  return { name: tx(RELATION_NAMES[r]), color: RELATION_COLORS[r] };
}

/** "Feind: Schwarm Xar", "Verbündet: …", "Frieden: …" (or `own` for the player's things). */
export function ownerLabel(state: GameState, owner: PlayerId | undefined, own: string): string {
  if (owner === 'wild') return t('wildAnimal');
  if (!owner || owner === viewerOf(state)) return own;
  const name = state.players[owner]?.name ?? t('enemy');
  const r = relationOf(state, viewerOf(state), owner);
  if (r === 'war') return t('enemyOf', { n: name });
  return r === 'alliance' ? t('allyOf', { n: name }) : t('peaceOf', { n: name });
}

const BUTTONS: Record<DiplomacyAction, { icon: IconName; label: string }> = {
  peace: { icon: 'handshake', label: t('offerPeace') },
  alliance: { icon: 'shield-check', label: t('offerAlliance') },
  war: { icon: 'swords', label: t('declareWar') },
  endAlliance: { icon: 'x', label: t('endAlliance') },
  decline: { icon: 'x', label: t('decline') },
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
      const n = state.players[id]?.name ?? id;
      if (r === 'war') return t('warWith', { n });
      return r === 'peace' ? t('peaceWith', { n }) : t('allianceWith', { n });
    });
  return parts.join(' · ');
}

function offerBox(session: Session, p: PlayerState): HTMLElement | null {
  const offer = offerFrom(session.state, p.id, viewerOf(session.state));
  if (!offer) return null;
  const offerText =
    offer.kind === 'peace' ? t('offersPeace', { n: p.name }) : t('offersAlliance', { n: p.name });
  return el(
    'div',
    { class: 'offer-box' },
    text(offerText, 'p-text good'),
    button(session, p.id, offer.kind, t('accept')),
    button(session, p.id, 'decline'),
  );
}

function sideCard(session: Session, p: PlayerState): HTMLElement {
  const s = session.state;
  const rel = relationLabel(s, p.id);
  const out = p.defeated;
  const hint = out ? undefined : actionsFor(s, p.id).map((a) => whyNot(s, viewerOf(s), p.id, a))[0];
  const hintText = hint ? tx(hint) : '';
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
      `${tx(FACTIONS[p.faction].name)} · ${out ? t('outOfGame') : strengthWord(s, p.id)}`,
      'p-text muted',
    ),
    out ? null : text(othersLine(s, p), 'p-text small'),
    out ? null : offerBox(session, p),
    ...(out ? [] : actionsFor(s, p.id).map((a) => button(session, p.id, a))),
    hintText ? text(hintText, 'p-text muted small') : null,
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
    header(t('peoples'), t('diplomacy')),
    text(t('peoplesHelp'), 'p-text muted'),
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
          .map((a) => whyNot(s, viewerOf(s), id, a)?.de ?? '')
          .join(),
  );
  const strength = sidesOf(s).map((id) => strengthWord(s, id));
  const out = sidesOf(s).map((id) => (s.players[id]?.defeated ? 1 : 0));
  return `peoples:${JSON.stringify([s.relations, s.offers, hints, strength, out])}`;
}
