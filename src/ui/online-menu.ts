import { makeName } from '../net/names';
import { el } from './dom';
import { icon, type IconName } from './icons';
import { t, lang } from '../i18n';

type Child = HTMLElement | string | false | undefined;

/** A dialog over the key art (online screens). */
export function onlineDialog(sub: string, title: string, ...children: Child[]): HTMLElement {
  return el(
    'div',
    { class: 'screen start online' },
    el('div', { class: 'keyart' }),
    el('div', { class: 'keyart-shade' }),
    el(
      'div',
      { class: 'panel dialog wide' },
      el('div', { class: 'p-sub' }, sub),
      el('h2', {}, title),
      ...children,
    ),
  );
}

export function button(
  ico: IconName,
  label: string,
  onclick: () => void,
  kind: '' | 'primary' | 'small' = '',
): HTMLElement {
  return el('button', { class: `m-item ${kind}`, onclick }, icon(ico), el('span', {}, label));
}

/** A red line with what went wrong (or nothing). */
export function problemLine(text?: string): HTMLElement | false {
  return !!text && el('p', { class: 'p-text dlg-error' }, icon('triangle-alert'), text);
}

export function privacyLink(): HTMLElement {
  return el('a', { class: 'privacy-link', href: '#datenschutz' }, t('privacyLink'));
}

export interface NamePickActions {
  pick(name: string): void;
  /** Device code from another device. */
  login(code: string): void;
  back(): void;
}

/** First time online: choose a made-up name. No real name, no e-mail, no password. */
export function namePicker(a: NamePickActions, problem?: string): HTMLElement {
  const names = el('div', { class: 'name-list' });
  const fill = (): void =>
    names.replaceChildren(
      ...[0, 1, 2].map(() => {
        const name = makeName(Math.random, lang());
        return el('button', { class: 'm-item name-pick', onclick: () => a.pick(name) }, name);
      }),
    );
  fill();
  const code = el('input', { class: 'code-input', placeholder: 'XXXX-XXXX-XXXX-XXXX-XXXX-XXXX' });
  return onlineDialog(
    t('mOnline'),
    t('pickName'),
    problemLine(problem),
    el('p', { class: 'p-text muted' }, t('nameHelp')),
    names,
    button('sparkles', t('otherNames'), fill, 'small'),
    el('h4', { class: 'dlg-h' }, t('haveAccount')),
    el(
      'div',
      { class: 'code-row' },
      code,
      button('log-in', t('login'), () => a.login(code.value)),
    ),
    privacyLink(),
    button('x', t('back'), () => a.back()),
  );
}

/** Shows the device code (it moves the account to another device). */
export function deviceCodeDialog(code: string, onClose: () => void): HTMLElement {
  const box = el('div', { class: 'device-code' }, code);
  const copy = (): void => void navigator.clipboard?.writeText(code).catch(() => undefined);
  const d = onlineDialog(
    t('account'),
    t('otherDevice'),
    el('p', { class: 'p-text' }, t('codeHelp')),
    box,
    button('copy', t('copy'), copy, 'small'),
    el('p', { class: 'p-text muted' }, t('codeSecret')),
    button('check', t('done'), () => onClose(), 'primary'),
  );
  return d;
}

/** "Really?" with a red button. */
export function confirmDialog(
  title: string,
  text: string,
  yes: { label: string; run: () => void },
  no: () => void,
): HTMLElement {
  return onlineDialog(
    t('sure'),
    title,
    el('p', { class: 'p-text' }, text),
    el(
      'div',
      { class: 'dlg-buttons' },
      button('x', t('cancel'), no),
      button('trash-2', yes.label, () => yes.run(), 'primary'),
    ),
  );
}

/** While connecting to a world or the lobby. */
export function waitScreen(text: string): HTMLElement {
  return el(
    'div',
    { class: 'screen loading' },
    el('div', { class: 'keyart' }),
    el('div', { class: 'keyart-shade' }),
    el('div', { class: 'load-box' }, el('div', { class: 'spinner' }), el('span', {}, text)),
  );
}
