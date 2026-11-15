import { el } from './dom';
import { icon, type IconName } from './icons';
import { langSwitch } from './lang-switch';
import { legalLinks } from './legal';
import { t } from '../i18n';

export interface MenuActions {
  newGame(): void;
  continueGame?: () => void;
  importGame(): void;
  /** Play with other people over the internet (M7). */
  online(): void;
}

function menuItem(ico: IconName, label: string, onclick: () => void, primary = false): HTMLElement {
  return el(
    'button',
    { class: primary ? 'm-item primary' : 'm-item', onclick },
    icon(ico),
    el('span', {}, label),
    el('span', { class: 'm-arrow' }, icon('chevron-right')),
  );
}

/** Start screen: key art in the back, title and menu on the left. */
export function mainMenu(actions: MenuActions): HTMLElement {
  const items = [
    actions.continueGame && menuItem('play', t('mContinue'), actions.continueGame, true),
    menuItem('rocket', t('mNewGame'), actions.newGame, !actions.continueGame),
    menuItem('globe', t('mOnline'), actions.online),
    menuItem('upload', t('mLoad'), actions.importGame),
  ];
  return el(
    'div',
    { class: 'screen start' },
    el('div', { class: 'keyart' }),
    el('div', { class: 'keyart-shade' }),
    langSwitch(),
    el(
      'div',
      { class: 'start-col' },
      el('div', { class: 'kicker' }, t('mKicker')),
      el('h1', { class: 'title' }, t('mTitle')),
      el('p', { class: 'lead' }, t('mLead')),
      el('nav', { class: 'm-list' }, ...items),
      el('div', { class: 'start-foot' }, t('mFoot')),
      legalLinks(),
    ),
  );
}

export interface PauseActions {
  resume(): void;
  /** Missing online (the server saves). */
  save?: () => void;
  exportFile?: () => void;
  quit(): void;
  /** Online: show the link to the world ("Freunde einladen"). */
  share?: () => void;
  /** Online: "Zur Lobby". */
  quitLabel?: string;
  /** Switches (sound, music, offline attacks). */
  settings: HTMLElement[];
}

export function pauseMenu(actions: PauseActions): HTMLElement {
  return el(
    'div',
    { class: 'screen modal' },
    el(
      'div',
      { class: 'panel dialog' },
      el('div', { class: 'p-sub' }, t('pSub')),
      el('h2', {}, t('pMenu')),
      el(
        'nav',
        { class: 'm-list' },
        menuItem('play', t('pResume'), actions.resume, true),
        actions.share && menuItem('send', t('invite'), actions.share),
        actions.save && menuItem('save', t('pSave'), actions.save),
        actions.exportFile && menuItem('download', t('pExport'), actions.exportFile),
        menuItem('log-out', actions.quitLabel ?? t('pQuit'), actions.quit),
      ),
      el('h4', { class: 'dlg-h' }, t('pSettings')),
      ...actions.settings,
      el('p', { class: 'p-text muted' }, actions.save ? t('pAutoSave') : t('pServerSave')),
    ),
  );
}

/** Shown while the 3D world loads. */
export function loadingScreen(): HTMLElement {
  return el(
    'div',
    { class: 'screen loading' },
    el('div', { class: 'keyart' }),
    el('div', { class: 'keyart-shade' }),
    el('div', { class: 'load-box' }, el('div', { class: 'spinner' }), el('span', {}, t('loading'))),
  );
}
