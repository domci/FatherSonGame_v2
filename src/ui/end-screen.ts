import { viewerOf } from '../sim/viewer';
import { FACTIONS } from '../content/factions';
import { alliesOf, sidesOf } from '../sim/relations';
import type { GameState } from '../sim/state';
import { el } from './dom';
import { icon, type IconName } from './icons';

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
    const who =
      others.length === 1 ? `Die ${FACTIONS[winner.faction].name} haben` : `${winner.name} hat`;
    return `Euer ${FACTIONS[me.faction].core} ist zerstört. ${who} gewonnen. Versucht es noch einmal!`;
  }
  const enemy = state.players[others[0] ?? 'ai'];
  if (others.length === 1 && enemy)
    return `Ihr habt den ${FACTIONS[enemy.faction].core} der ${FACTIONS[enemy.faction].name} zerstört. Der Planet gehört euch!`;
  const friends = alliesOf(state, viewerOf(state)).map((id) => state.players[id]?.name ?? id);
  const together = friends.length ? ` Zusammen mit ${friends.join(' und ')}.` : '';
  return `Alle Feinde sind besiegt. Das Sonnensystem gehört euch!${together}`;
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
      el('div', { class: 'p-sub' }, 'Spiel vorbei'),
      el('h2', {}, title),
      el('p', { class: 'p-text' }, text),
      el('nav', { class: 'm-list' }, ...buttons),
    ),
  );
}

/** Victory or defeat: shown once the game has a winner. */
export function endScreen(won: boolean, text: string, a: EndActions): HTMLElement {
  return endDialog(won, won ? 'Sieg!' : 'Niederlage', text, [
    endButton('log-out', 'Zum Hauptmenü', () => a.menu(), true),
    endButton('eye', 'Weiter ansehen', () => a.watch()),
  ]);
}

/** Online there is no end: a beaten person starts again on the home planet, or leaves. */
export function onlineDefeatScreen(
  state: GameState,
  a: { restart(): void; lobby(): void },
): HTMLElement {
  const me = state.players[viewerOf(state)];
  const core = FACTIONS[me?.faction ?? 'human'].core;
  const text = `Euer ${core} ist zerstört. Ihr könnt auf eurem Planeten neu anfangen. Die anderen spielen weiter.`;
  return endDialog(false, 'Besiegt', text, [
    endButton('rocket', 'Neu anfangen', () => a.restart(), true),
    endButton('log-out', 'Zur Lobby', () => a.lobby()),
  ]);
}
