import { DIFFICULTY_NAMES, type Difficulty } from '../content/ai';
import { FACTIONS, type Faction } from '../content/factions';
import { thumb } from './build-menu';
import { el } from './dom';
import { icon } from './icons';
import { toggleRow } from './menu-kit';

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

function levelPicker(choice: NewGameChoice): HTMLElement {
  const levels = (Object.keys(DIFFICULTY_NAMES) as Difficulty[]).map((d) =>
    el(
      'button',
      {
        class: d === choice.difficulty ? 'seg-btn on' : 'seg-btn',
        'data-level': d,
        onclick: () => {
          choice.difficulty = d;
          levels.forEach((b) => b.classList.toggle('on', b.dataset.level === d));
        },
      },
      DIFFICULTY_NAMES[d],
    ),
  );
  return el('div', { class: 'panel seg' }, ...levels);
}

/** Choose people, difficulty and offline attacks before a new game starts. */
export function newGameDialog(
  onStart: (c: NewGameChoice) => void,
  onBack: () => void,
): HTMLElement {
  const choice: NewGameChoice = { faction: 'human', difficulty: 'normal', offlineAttacks: false };
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
      levelPicker(choice),
      offline,
      buttons,
    ),
  );
}
