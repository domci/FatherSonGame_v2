import { LocError } from '../content/text';
import { fill, tx } from './lang';
import { UI, type UiKey } from './catalog';

export { lang, setLang, tx, fill, detectLang } from './lang';
export type { UiKey };

/** A UI text in the current language, with {name} places filled. */
export function t(key: UiKey, vars?: Record<string, string | number>): string {
  return fill(tx(UI[key]), vars);
}

/** The message of an error in the current language. */
export function errorText(e: unknown): string {
  if (e instanceof LocError) return tx(e.text);
  return e instanceof Error ? e.message : String(e);
}
