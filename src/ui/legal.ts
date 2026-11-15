import { LEGAL } from '../content/legal';
import { el } from './dom';
import { t } from '../i18n';

function out(href: string, label: string): HTMLElement {
  return el('a', { href, target: '_blank', rel: 'noopener' }, label);
}

/** Small links at the bottom: privacy page of the game and legal notice (Impressum). */
export function legalLinks(): HTMLElement {
  return el(
    'div',
    { class: 'legal-links' },
    el('a', { href: '#datenschutz' }, t('privacyShort')),
    el('span', {}, ' · '),
    out(LEGAL.imprint, t('imprint')),
  );
}

/** Links at the end of the privacy page: legal notice and the privacy page of the operator. */
export function operatorLinks(): HTMLElement {
  return el(
    'div',
    { class: 'legal-links' },
    out(LEGAL.imprint, t('imprint')),
    el('span', {}, ' · '),
    out(LEGAL.privacy, 'dom-builds.com/datenschutz'),
  );
}
