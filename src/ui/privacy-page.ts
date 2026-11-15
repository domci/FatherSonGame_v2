import { PRIVACY_PARTS } from '../i18n/privacy-text';
import { el } from './dom';
import { icon } from './icons';
import { t, tx } from '../i18n';

/** "Datenschutz": what the online game keeps, and what it never keeps. */
export function privacyPage(onClose: () => void): HTMLElement {
  return el(
    'div',
    { class: 'screen modal info-page' },
    el(
      'div',
      { class: 'panel dialog wide' },
      el('div', { class: 'p-sub' }, t('privacy')),
      el('h2', {}, t('yourData')),
      ...PRIVACY_PARTS.flatMap(([title, lines]) => [
        el('h4', { class: 'dlg-h' }, tx(title)),
        el('ul', { class: 'log' }, ...lines.map((l) => el('li', {}, tx(l)))),
      ]),
      el(
        'button',
        { class: 'm-item primary', onclick: () => onClose() },
        icon('check'),
        el('span', {}, t('understood')),
      ),
    ),
  );
}
