import { el } from './dom';
import { icon, type IconName } from './icons';

export interface MenuActions {
  newGame(): void;
  continueGame?: () => void;
  importGame(): void;
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
    actions.continueGame && menuItem('play', 'Weiterspielen', actions.continueGame, true),
    menuItem('rocket', 'Neues Spiel', actions.newGame, !actions.continueGame),
    menuItem('upload', 'Spielstand laden', actions.importGame),
  ];
  return el(
    'div',
    { class: 'screen start' },
    el('div', { class: 'keyart' }),
    el('div', { class: 'keyart-shade' }),
    el(
      'div',
      { class: 'start-col' },
      el('div', { class: 'kicker' }, 'Ein Weltraum-Strategiespiel'),
      el('h1', { class: 'title' }, 'Bruchlandung'),
      el(
        'p',
        { class: 'lead' },
        'Euer Schiff ist abgestürzt. Baut eine Kuppel-Basis, holt Rohstoffe aus dem All und behauptet euch gegen Spinnenwesen und Aliens.',
      ),
      el('nav', { class: 'm-list' }, ...items),
      el(
        'div',
        { class: 'start-foot' },
        'Spielt als Menschen oder als Aliens  ·  Für Kinder ab 10',
      ),
    ),
  );
}

export interface PauseActions {
  resume(): void;
  save(): void;
  exportFile(): void;
  quit(): void;
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
      el('div', { class: 'p-sub' }, 'Pause'),
      el('h2', {}, 'Menü'),
      el(
        'nav',
        { class: 'm-list' },
        menuItem('play', 'Weiter', actions.resume, true),
        menuItem('save', 'Jetzt speichern', actions.save),
        menuItem('download', 'Spielstand als Datei', actions.exportFile),
        menuItem('log-out', 'Zum Hauptmenü', actions.quit),
      ),
      el('h4', { class: 'dlg-h' }, 'Einstellungen'),
      ...actions.settings,
      el('p', { class: 'p-text muted' }, 'Das Spiel speichert alle 2 Minuten von selbst.'),
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
    el(
      'div',
      { class: 'load-box' },
      el('div', { class: 'spinner' }),
      el('span', {}, 'Landeanflug …'),
    ),
  );
}
