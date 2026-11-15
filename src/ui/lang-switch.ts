import { LANGS } from '../content/text';
import { el } from './dom';
import { t, lang, setLang } from '../i18n';

/** DE | EN buttons. A new language reloads the page, so every text is fresh. */
export function langSwitch(): HTMLElement {
  const buttons = LANGS.map((l) =>
    el(
      'button',
      {
        class: l === lang() ? 'seg-btn on' : 'seg-btn',
        'data-lang': l,
        title: t('language'),
        onclick: () => {
          if (l === lang()) return;
          setLang(l);
          location.reload();
        },
      },
      l.toUpperCase(),
    ),
  );
  return el('div', { class: 'panel seg lang-switch' }, ...buttons);
}
