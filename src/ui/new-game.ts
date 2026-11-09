import type { Difficulty } from '../content/ai';
import { FACTIONS, type Faction } from '../content/factions';
import { thumb } from './build-menu';
import { el } from './dom';
import { icon } from './icons';
import { levelPicker, toggleRow } from './menu-kit';

export interface NewGameChoice {
  faction: Faction;
  difficulty: Difficulty;
  offlineAttacks: boolean;
}

function factionCard(f: Faction, pick: (f: Faction) => void): HTMLElement {
  const info = FACTIONS[f];
  return el(
    'button',
    { class: `faction-card ${f}`, onclick: () => pick(f), 'data-faction': f },
    el('span', { class: 'fc-img' }, thumb('commandDome', 'thumb', f)),
    el('span', { class: 'fc-name' }, info.name),
    el('span', { class: 'fc-text' }, info.pitch),
  );
}

/** Two big cards: humans or aliens. */
function factionPicker(choice: NewGameChoice): HTMLElement {
  const cards = (['human', 'alien'] as const).map((f) =>
    factionCard(f, (x) => {
      choice.faction = x;
      cards.forEach((c) => c.classList.toggle('on', c.dataset.faction === x));
    }),
  );
  cards[0]?.classList.add('on');
  return el('div', { class: 'faction-row' }, ...cards);
}

/** Choose people, difficulty and offline attacks before a new game starts. */
export function newGameDialog(
  onStart: (c: NewGameChoice) => void,
  onBack: () => void,
): HTMLElement {
  const choice: NewGameChoice = { faction: 'human', difficulty: 'easy', offlineAttacks: false };
  const offline = toggleRow(
    'Angriffe, auch wenn keiner spielt',
    'Aus: Der Feind greift nur an, wenn ihr spielt.',
    false,
    (on) => (choice.offlineAttacks = on),
  );
  const buttons = el(
    'div',
    { class: 'dlg-buttons' },
    el('button', { class: 'm-item', onclick: () => onBack() }, icon('x'), el('span', {}, 'Zurück')),
    el(
      'button',
      { class: 'm-item primary', onclick: () => onStart(choice) },
      icon('rocket'),
      el('span', {}, "Los geht's"),
    ),
  );
  return el(
    'div',
    { class: 'screen modal' },
    el(
      'div',
      { class: 'panel dialog wide' },
      el('div', { class: 'p-sub' }, 'Neues Spiel'),
      el('h2', {}, 'Wählt euer Volk'),
      factionPicker(choice),
      el('h4', { class: 'dlg-h' }, 'Gegner'),
      levelPicker(choice.difficulty, (d) => (choice.difficulty = d)),
      offline,
      buttons,
    ),
  );
}
