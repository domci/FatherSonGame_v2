import { DIFFICULTY_NAMES } from '../content/ai';
import { ONLINE } from '../content/online';
import type { NewWorld, WorldInfo } from '../net/protocol';
import type { Faction } from '../sim/state';
import { el } from './dom';
import { icon } from './icons';
import { levelPicker, segRow, toggleRow } from './menu-kit';
import { factionPicker } from './new-game';
import { button, onlineDialog, privacyLink, problemLine } from './online-menu';

export interface LobbyActions {
  /** Play in a world (own seat, or a new seat in an open world). */
  enter(w: WorldInfo): void;
  joinCode(code: string): void;
  newWorld(): void;
  deviceCode(): void;
  deleteAccount(): void;
  back(): void;
}

function worldRow(w: WorldInfo, label: string, go: () => void): HTMLElement {
  const sides = w.people + w.computers;
  return el(
    'div',
    { class: 'world-row' },
    el(
      'div',
      { class: 'wr-text' },
      el('span', { class: 'wr-name' }, w.name),
      el(
        'span',
        { class: 'wr-info' },
        `${DIFFICULTY_NAMES[w.difficulty]} · ${w.taken}/${w.people} Menschen · ${sides} Völker · Code ${w.code}`,
      ),
    ),
    el(
      'button',
      { class: 'm-item primary small', onclick: go },
      icon('play'),
      el('span', {}, label),
    ),
  );
}

function worldList(list: WorldInfo[], label: string, go: (w: WorldInfo) => void, empty: string) {
  if (list.length === 0) return el('p', { class: 'p-text muted' }, empty);
  return el('div', { class: 'world-list' }, ...list.map((w) => worldRow(w, label, () => go(w))));
}

/** Your worlds, open worlds, a new world, join by code, and your account. */
export function lobbyScreen(
  name: string,
  worlds: { mine: WorldInfo[]; open: WorldInfo[] },
  a: LobbyActions,
  problem?: string,
): HTMLElement {
  const code = el('input', { class: 'code-input', maxlength: '6', placeholder: 'ABC123' });
  return onlineDialog(
    'Online spielen',
    `Hallo, ${name}!`,
    problemLine(problem),
    el('h4', { class: 'dlg-h' }, 'Deine Welten'),
    worldList(
      worlds.mine,
      'Spielen',
      a.enter,
      'Noch keine. Mach eine neue Welt oder tritt einer bei.',
    ),
    button('plus', 'Neue Welt', () => a.newWorld(), 'primary'),
    el('h4', { class: 'dlg-h' }, 'Offene Welten mit freiem Platz'),
    worldList(
      worlds.open,
      'Beitreten',
      a.enter,
      'Gerade keine. Frag Freunde nach ihrem Welt-Code.',
    ),
    el(
      'div',
      { class: 'code-row' },
      code,
      button('log-in', 'Mit Code beitreten', () => a.joinCode(code.value)),
    ),
    ...accountPart(a),
  );
}

function accountPart(a: LobbyActions): HTMLElement[] {
  return [
    el('h4', { class: 'dlg-h' }, 'Dein Konto'),
    el(
      'div',
      { class: 'dlg-buttons' },
      button('key-round', 'Anderes Gerät', () => a.deviceCode(), 'small'),
      button('trash-2', 'Konto löschen', () => a.deleteAccount(), 'small'),
    ),
    privacyLink(),
    button('x', 'Zurück', () => a.back()),
  ];
}

const PEOPLE = [
  { value: 2, text: '2', help: 'Du und ein Freund oder eine Freundin.' },
  { value: 3, text: '3', help: 'Drei Menschen in einem Sonnensystem.' },
  { value: 4, text: '4', help: 'Vier Menschen: ein großes Sonnensystem.' },
];
const COMPUTERS = [
  { value: 0, text: '0', help: 'Nur Menschen.' },
  { value: 1, text: '1', help: 'Dazu ein Computer-Volk.' },
  { value: 2, text: '2', help: 'Dazu zwei Computer-Völker.' },
];

/** Choose people, computers, level and who may join. The world gets a name from you. */
export function newWorldDialog(
  owner: string,
  onCreate: (w: NewWorld) => void,
  onBack: () => void,
): HTMLElement {
  const w: NewWorld = {
    name: `Welt von ${owner}`,
    difficulty: 'easy',
    computers: 0,
    people: 2,
    open: false,
    faction: 'human',
  };
  const create = (): void =>
    onCreate({ ...w, computers: Math.min(w.computers, ONLINE.maxSides - w.people) });
  return onlineDialog(
    'Neue Welt',
    'Wählt euer Volk',
    factionPicker(w),
    segRow('Menschen', PEOPLE, w.people, (n) => (w.people = n)),
    segRow('Computer', COMPUTERS, w.computers, (n) => (w.computers = n)),
    el('p', { class: 'p-text muted' }, `Höchstens ${ONLINE.maxSides} Völker zusammen.`),
    levelPicker(w.difficulty, (d) => (w.difficulty = d)),
    toggleRow(
      'Offen für alle',
      'An: Jeder kann beitreten. Aus: Nur wer den Welt-Code kennt.',
      w.open,
      (on) => (w.open = on),
    ),
    el(
      'div',
      { class: 'dlg-buttons' },
      button('x', 'Zurück', onBack),
      button('rocket', 'Welt bauen', create, 'primary'),
    ),
  );
}

/** A new seat in someone else's world: humans or aliens? */
export function joinDialog(
  w: WorldInfo,
  onJoin: (f: Faction) => void,
  onBack: () => void,
): HTMLElement {
  const choice: { faction: Faction } = { faction: 'human' };
  return onlineDialog(
    `Beitreten: ${w.name}`,
    'Wählt euer Volk',
    factionPicker(choice),
    el(
      'p',
      { class: 'p-text muted' },
      'Neue Spieler haben 3 Tage Schutz: In der Zeit kann euch kein Mensch angreifen.',
    ),
    el(
      'div',
      { class: 'dlg-buttons' },
      button('x', 'Zurück', onBack),
      button('rocket', 'Beitreten', () => onJoin(choice.faction), 'primary'),
    ),
  );
}
