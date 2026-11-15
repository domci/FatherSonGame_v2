import type { Difficulty } from '../content/ai';
import { FACTIONS, type Faction } from '../content/factions';
import { thumb } from './build-menu';
import { el } from './dom';
import { icon } from './icons';
import { levelPicker, opponentPicker, toggleRow } from './menu-kit';
import { t, tx } from '../i18n';

export interface NewGameChoice {
  faction: Faction;
  difficulty: Difficulty;
  offlineAttacks: boolean;
  /** Computer peoples, 1..3. */
  opponents: number;
}

function factionCard(f: Faction, pick: (f: Faction) => void): HTMLElement {
  const info = FACTIONS[f];
  return el(
    'button',
    { class: `faction-card ${f}`, onclick: () => pick(f), 'data-faction': f },
    el('span', { class: 'fc-img' }, thumb('commandDome', 'thumb', f)),
    el('span', { class: 'fc-name' }, tx(info.name)),
    el('span', { class: 'fc-text' }, tx(info.pitch)),
  );
}

/** Two big cards: humans or aliens. */
export function factionPicker(choice: { faction: Faction }): HTMLElement {
  const cards = (['human', 'alien'] as const).map((f) =>
    factionCard(f, (x) => {
      choice.faction = x;
      cards.forEach((c) => c.classList.toggle('on', c.dataset.faction === x));
    }),
  );
  cards[0]?.classList.add('on');
  return el('div', { class: 'faction-row' }, ...cards);
}

function dialogButtons(
  choice: NewGameChoice,
  onStart: (c: NewGameChoice) => void,
  onBack: () => void,
): HTMLElement {
  return el(
    'div',
    { class: 'dlg-buttons' },
    el(
      'button',
      { class: 'm-item', onclick: () => onBack() },
      icon('x'),
      el('span', {}, t('back')),
    ),
    el(
      'button',
      { class: 'm-item primary', onclick: () => onStart(choice) },
      icon('rocket'),
      el('span', {}, t('letsGo')),
    ),
  );
}

/** Choose people, opponents, difficulty and offline attacks before a new game starts. */
export function newGameDialog(
  onStart: (c: NewGameChoice) => void,
  onBack: () => void,
): HTMLElement {
  const choice: NewGameChoice = {
    faction: 'human',
    difficulty: 'easy',
    offlineAttacks: false,
    opponents: 1,
  };
  const offline = toggleRow(
    t('offlineAtk'),
    t('offlineAtkHelp'),
    false,
    (on) => (choice.offlineAttacks = on),
  );
  return el(
    'div',
    { class: 'screen modal' },
    el(
      'div',
      { class: 'panel dialog wide' },
      el('div', { class: 'p-sub' }, t('newGameSub')),
      el('h2', {}, t('chooseFaction')),
      factionPicker(choice),
      el('h4', { class: 'dlg-h' }, t('opponents')),
      opponentPicker(choice.opponents, (n) => (choice.opponents = n)),
      levelPicker(choice.difficulty, (d) => (choice.difficulty = d)),
      offline,
      dialogButtons(choice, onStart, onBack),
    ),
  );
}
