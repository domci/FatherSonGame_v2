import { FACTIONS, type Faction } from '../content/factions';
import { el } from './dom';
import { icon } from './icons';

export interface EndActions {
  menu(): void;
  watch(): void;
}

/** Victory or defeat: shown once the main building of one side is destroyed. */
export function endScreen(
  won: boolean,
  faction: Faction,
  enemy: Faction,
  a: EndActions,
): HTMLElement {
  const lost = won ? FACTIONS[enemy].core : FACTIONS[faction].core;
  const text = won
    ? `Ihr habt den ${lost} der ${FACTIONS[enemy].name} zerstört. Der Planet gehört euch!`
    : `Euer ${lost} ist zerstört. Die ${FACTIONS[enemy].name} haben gewonnen. Versucht es noch einmal!`;
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
