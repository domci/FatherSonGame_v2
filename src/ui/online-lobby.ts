import { DIFFICULTY_NAMES } from '../content/ai';
import { ONLINE } from '../content/online';
import type { NewWorld, WorldInfo } from '../net/protocol';
import type { Faction } from '../sim/state';
import { el } from './dom';
import { icon } from './icons';
import { levelPicker, segRow, toggleRow } from './menu-kit';
import { factionPicker } from './new-game';
import { button, onlineDialog, privacyLink, problemLine } from './online-menu';
import { shareBox } from './share-world';

export interface LobbyActions {
  /** Play in a world (own seat, or a new seat in an open world). */
  enter(w: WorldInfo): void;
  joinCode(code: string): void;
  /** Show the link of one of your worlds, to send it to friends. */
  share(w: WorldInfo): void;
  newWorld(): void;
  deviceCode(): void;
  deleteAccount(): void;
  back(): void;
}

function worldRow(w: WorldInfo, label: string, go: () => void, share?: () => void): HTMLElement {
  const computers = w.computers > 0 ? ` · ${w.computers} Computer` : '';
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
        `${DIFFICULTY_NAMES[w.difficulty]} · ${w.taken} Menschen${computers} · Code ${w.code}`,
      ),
    ),
    share && button('send', 'Einladen', share, 'small'),
    el(
      'button',
      { class: 'm-item primary small', onclick: go },
      icon('play'),
      el('span', {}, label),
    ),
  );
}

interface ListParts {
  label: string;
  go: (w: WorldInfo) => void;
  empty: string;
  share?: (w: WorldInfo) => void;
}

function worldList(list: WorldInfo[], p: ListParts): HTMLElement {
  if (list.length === 0) return el('p', { class: 'p-text muted' }, p.empty);
  const row = (w: WorldInfo): HTMLElement => {
    const share = p.share;
    return worldRow(w, p.label, () => p.go(w), share && (() => share(w)));
  };
  return el('div', { class: 'world-list' }, ...list.map(row));
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
    worldList(worlds.mine, {
      label: 'Spielen',
      go: a.enter,
      empty: 'Noch keine. Mach eine neue Welt oder tritt einer bei.',
      share: a.share,
    }),
    button('plus', 'Neue Welt', () => a.newWorld(), 'primary'),
    el('h4', { class: 'dlg-h' }, 'Offene Welten'),
    worldList(worlds.open, {
      label: 'Beitreten',
      go: a.enter,
      empty: 'Gerade keine. Frag Freunde nach dem Link zu ihrer Welt.',
    }),
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

const COMPUTERS = [
  { value: 0, text: '0', help: 'Nur Menschen.' },
  { value: 1, text: '1', help: 'Dazu ein Computer-Volk.' },
  { value: 2, text: '2', help: 'Dazu zwei Computer-Völker.' },
];

/**
 * Choose computers, level and who may join. The world gets a name from you.
 * Places for people: all the others at the start; the world grows when more people come.
 */
export function newWorldDialog(
  owner: string,
  onCreate: (w: NewWorld) => void,
  onBack: () => void,
): HTMLElement {
  const w: NewWorld = {
    name: `Welt von ${owner}`,
    difficulty: 'easy',
    computers: 0,
    people: ONLINE.maxSides,
    open: false,
    faction: 'human',
  };
  const create = (): void => onCreate({ ...w, people: ONLINE.maxSides - w.computers });
  return onlineDialog(
    'Neue Welt',
    'Wählt euer Volk',
    factionPicker(w),
    segRow('Computer', COMPUTERS, w.computers, (n) => (w.computers = n)),
    el(
      'p',
      { class: 'p-text muted' },
      `Freunde kommen mit dem Link zur Welt. Für jeden neuen Spieler kommt ein Planet dazu (bis ${ONLINE.maxGrownSides} Völker).`,
    ),
    levelPicker(w.difficulty, (d) => (w.difficulty = d)),
    toggleRow(
      'Offen für alle',
      'An: Jeder sieht die Welt in der Liste. Aus: Nur wer den Link oder Code hat.',
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

/** The link to one of your worlds, to send to friends. */
export function shareScreen(w: WorldInfo, onBack: () => void): HTMLElement {
  return onlineDialog(
    'Freunde einladen',
    w.name,
    ...shareBox(w),
    el('div', { class: 'dlg-buttons' }, button('x', 'Zurück', onBack)),
  );
}
