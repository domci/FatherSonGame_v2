import { el } from './dom';

export interface MenuActions {
  newGame(): void;
  continueGame?: () => void;
  importGame(): void;
}

/** Start screen. */
export function mainMenu(actions: MenuActions): HTMLElement {
  return el(
    'div',
    { class: 'overlay menu' },
    el(
      'div',
      { class: 'card' },
      el('h1', {}, 'Bruchlandung'),
      el('p', { class: 'muted' }, 'Ein Weltraum-Strategiespiel'),
      actions.continueGame &&
        el('button', { class: 'big', onclick: actions.continueGame }, '▶ Weiterspielen'),
      el('button', { class: 'big', onclick: actions.newGame }, '✨ Neues Spiel (Menschen)'),
      el(
        'button',
        { class: 'big secondary', onclick: actions.importGame },
        '📂 Spielstand-Datei laden',
      ),
      el('p', { class: 'muted small' }, 'Aliens als spielbares Volk kommen in Meilenstein 3.'),
    ),
  );
}

export interface PauseActions {
  resume(): void;
  save(): void;
  exportFile(): void;
  quit(): void;
}

export function pauseMenu(actions: PauseActions): HTMLElement {
  return el(
    'div',
    { class: 'overlay menu' },
    el(
      'div',
      { class: 'card' },
      el('h2', {}, 'Menü'),
      el('button', { class: 'big', onclick: actions.resume }, '▶ Weiter'),
      el('button', { class: 'big secondary', onclick: actions.save }, '💾 Jetzt speichern'),
      el(
        'button',
        { class: 'big secondary', onclick: actions.exportFile },
        '📤 Spielstand als Datei',
      ),
      el('button', { class: 'big secondary', onclick: actions.quit }, '🏁 Zum Hauptmenü'),
      el('p', { class: 'muted small' }, 'Das Spiel speichert alle 2 Minuten von selbst.'),
    ),
  );
}
