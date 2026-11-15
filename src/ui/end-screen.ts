import { viewerOf } from '../sim/viewer';
import { FACTIONS } from '../content/factions';
import { alliesOf, sidesOf } from '../sim/relations';
import type { GameState } from '../sim/state';
import { el } from './dom';
import { icon, type IconName } from './icons';
import { t, tx } from '../i18n';

export interface EndActions {
  menu(): void;
  watch(): void;
}

/** What happened: who won, and with whom. */
export function endText(state: GameState): string {
  const me = state.players[viewerOf(state)];
  const winner = state.winner && state.players[state.winner];
  if (!me || !winner) return '';
  const others = sidesOf(state).filter((id) => id !== viewerOf(state));
  if (state.winner !== viewerOf(state)) {
    const core = tx(FACTIONS[me.faction].core);
    return others.length === 1
      ? t('lostToPeople', { c: core, w: tx(FACTIONS[winner.faction].name) })
      : t('lostToSide', { c: core, w: winner.name });
  }
  const enemy = state.players[others[0] ?? 'ai'];
  if (others.length === 1 && enemy)
    return t('wonOne', {
      c: tx(FACTIONS[enemy.faction].core),
      p: tx(FACTIONS[enemy.faction].name),
    });
  const friends = alliesOf(state, viewerOf(state)).map((id) => state.players[id]?.name ?? id);
  const together = friends.length ? ` ${t('together', { n: friends.join(t('and')) })}` : '';
  return `${t('wonAll')}${together}`;
}

function endButton(
  ico: IconName,
  label: string,
  onclick: () => void,
  primary = false,
): HTMLElement {
  return el(
    'button',
    { class: primary ? 'm-item primary' : 'm-item', onclick },
    icon(ico),
    el('span', {}, label),
  );
}

function endDialog(won: boolean, title: string, text: string, buttons: HTMLElement[]): HTMLElement {
  return el(
    'div',
    { class: `screen modal end ${won ? 'won' : 'lost'}` },
    el(
      'div',
      { class: 'panel dialog' },
      el('div', { class: 'end-icon' }, icon(won ? 'trophy' : 'frown')),
      el('div', { class: 'p-sub' }, t('gameOver')),
      el('h2', {}, title),
      el('p', { class: 'p-text' }, text),
      el('nav', { class: 'm-list' }, ...buttons),
    ),
  );
}

/** Victory or defeat: shown once the game has a winner. */
export function endScreen(won: boolean, text: string, a: EndActions): HTMLElement {
  return endDialog(won, won ? t('victory') : t('defeat'), text, [
    endButton('log-out', t('pQuit'), () => a.menu(), true),
    endButton('eye', t('watchOn'), () => a.watch()),
  ]);
}

/** Online there is no end: a beaten person starts again on the home planet, or leaves. */
export function onlineDefeatScreen(
  state: GameState,
  a: { restart(): void; lobby(): void },
): HTMLElement {
  const me = state.players[viewerOf(state)];
  const core = tx(FACTIONS[me?.faction ?? 'human'].core);
  const text = t('onlineDefeat', { c: core });
  return endDialog(false, t('defeated'), text, [
    endButton('rocket', t('restart'), () => a.restart(), true),
    endButton('log-out', t('toLobby'), () => a.lobby()),
  ]);
}
