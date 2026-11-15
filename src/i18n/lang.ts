import { LANGS, type Lang, type Loc } from '../content/text';

/** The current language of this browser. Not part of the save: every player picks their own. */
const KEY = 'bruchlandung:lang';
let current: Lang = detectLang();

/** Saved choice first, then the browser language. German browsers get German, all others English. */
export function detectLang(): Lang {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved && (LANGS as readonly string[]).includes(saved)) return saved as Lang;
  } catch {
    // Private mode: no saved choice.
  }
  const nav = typeof navigator === 'undefined' ? [] : (navigator.languages ?? [navigator.language]);
  const first = nav[0] ?? '';
  return first.toLowerCase().startsWith('de') ? 'de' : 'en';
}

export function lang(): Lang {
  return current;
}

export function setLang(next: Lang): void {
  current = next;
  try {
    localStorage.setItem(KEY, next);
  } catch {
    // Private mode: the choice is only kept until the page closes.
  }
  if (typeof document !== 'undefined') document.documentElement.lang = next;
}

/** The text in the current language. */
export function tx(text: Loc): string {
  return text[current];
}

/** Fills {name} places in a text. */
export function fill(text: string, vars?: Record<string, string | number>): string {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (all, k: string) => (k in vars ? String(vars[k]) : all));
}
