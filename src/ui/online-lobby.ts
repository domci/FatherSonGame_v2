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
import { t, tx } from '../i18n';

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
  const computers = w.computers > 0 ? ` · ${t('nComputers', { n: w.computers })}` : '';
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
        t('worldInfo', { d: tx(DIFFICULTY_NAMES[w.difficulty]), t: w.taken, c: w.code }) +
          computers,
      ),
    ),
    share && button('send', t('inviteBtn'), share, 'small'),
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
    t('mOnline'),
    t('hello', { n: name }),
    problemLine(problem),
    el('h4', { class: 'dlg-h' }, t('yourWorlds')),
    worldList(worlds.mine, {
      label: t('play'),
      go: a.enter,
      empty: t('noWorlds'),
      share: a.share,
    }),
    button('plus', t('newWorld'), () => a.newWorld(), 'primary'),
    el('h4', { class: 'dlg-h' }, t('openWorlds')),
    worldList(worlds.open, { label: t('joinBtn'), go: a.enter, empty: t('noOpen') }),
    el(
      'div',
      { class: 'code-row' },
      code,
      button('log-in', t('joinCode'), () => a.joinCode(code.value)),
    ),
    ...accountPart(a),
  );
}

function accountPart(a: LobbyActions): HTMLElement[] {
  return [
    el('h4', { class: 'dlg-h' }, t('yourAccount')),
    el(
      'div',
      { class: 'dlg-buttons' },
      button('key-round', t('otherDev'), () => a.deviceCode(), 'small'),
      button('trash-2', t('deleteAcc'), () => a.deleteAccount(), 'small'),
    ),
    privacyLink(),
    button('x', t('back'), () => a.back()),
  ];
}

const COMPUTERS = [
  { value: 0, text: '0', help: t('c0') },
  { value: 1, text: '1', help: t('c1') },
  { value: 2, text: '2', help: t('c2') },
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
    name: t('worldOf', { n: owner }),
    difficulty: 'easy',
    computers: 0,
    people: ONLINE.maxSides,
    open: false,
    faction: 'human',
  };
  const create = (): void => onCreate({ ...w, people: ONLINE.maxSides - w.computers });
  return onlineDialog(
    t('newWorld'),
    t('chooseFaction'),
    factionPicker(w),
    segRow(t('computer'), COMPUTERS, w.computers, (n) => (w.computers = n)),
    el('p', { class: 'p-text muted' }, t('growHelp', { n: ONLINE.maxGrownSides })),
    levelPicker(w.difficulty, (d) => (w.difficulty = d)),
    toggleRow(t('openAll'), t('openHelp'), w.open, (on) => (w.open = on)),
    el(
      'div',
      { class: 'dlg-buttons' },
      button('x', t('back'), onBack),
      button('rocket', t('buildWorld'), create, 'primary'),
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
    t('joinTitle', { n: w.name }),
    t('chooseFaction'),
    factionPicker(choice),
    el('p', { class: 'p-text muted' }, t('shield3')),
    el(
      'div',
      { class: 'dlg-buttons' },
      button('x', t('back'), onBack),
      button('rocket', t('joinBtn'), () => onJoin(choice.faction), 'primary'),
    ),
  );
}

/** The link to one of your worlds, to send to friends. */
export function shareScreen(w: WorldInfo, onBack: () => void): HTMLElement {
  return onlineDialog(
    t('invite'),
    w.name,
    ...shareBox(w),
    el('div', { class: 'dlg-buttons' }, button('x', t('back'), onBack)),
  );
}
