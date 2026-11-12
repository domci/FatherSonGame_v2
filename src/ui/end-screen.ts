import { FACTIONS } from '../content/factions';
import { alliesOf, sidesOf } from '../sim/relations';
import type { GameState } from '../sim/state';
import { el } from './dom';
import { icon } from './icons';

export interface EndActions {
  menu(): void;
  watch(): void;
}

/** What happened: who won, and with whom. */
export function endText(state: GameState): string {
  const me = state.players.player;
  const winner = state.winner && state.players[state.winner];
  if (!me || !winner) return '';
  const others = sidesOf(state).filter((id) => id !== 'player');
  if (state.winner !== 'player') {
    const who =
      others.length === 1 ? `Die ${FACTIONS[winner.faction].name} haben` : `${winner.name} hat`;
    return `Euer ${FACTIONS[me.faction].core} ist zerstört. ${who} gewonnen. Versucht es noch einmal!`;
  }
  const enemy = state.players[others[0] ?? 'ai'];
  if (others.length === 1 && enemy)
    return `Ihr habt den ${FACTIONS[enemy.faction].core} der ${FACTIONS[enemy.faction].name} zerstört. Der Planet gehört euch!`;
  const friends = alliesOf(state, 'player').map((id) => state.players[id]?.name ?? id);
  const together = friends.length ? ` Zusammen mit ${friends.join(' und ')}.` : '';
  return `Alle Feinde sind besiegt. Das Sonnensystem gehört euch!${together}`;
}

/** Victory or defeat: shown once the game has a winner. */
export function endScreen(won: boolean, text: string, a: EndActions): HTMLElement {
  return el(
    'div',
    { class: `screen modal end ${won ? 'won' : 'lost'}` },
    el(
      'div',
      { class: 'panel dialog' },
      el('div', { class: 'end-icon' }, icon(won ? 'trophy' : 'frown')),
      el('div', { class: 'p-sub' }, 'Spiel vorbei'),
      el('h2', {}, won ? 'Sieg!' : 'Niederlage'),
      el('p', { class: 'p-text' }, text),
      el(
        'nav',
        { class: 'm-list' },
        el(
          'button',
          { class: 'm-item primary', onclick: () => a.menu() },
          icon('log-out'),
          el('span', {}, 'Zum Hauptmenü'),
        ),
        el(
          'button',
          { class: 'm-item', onclick: () => a.watch() },
          icon('eye'),
          el('span', {}, 'Weiter ansehen'),
        ),
      ),
    ),
  );
}
