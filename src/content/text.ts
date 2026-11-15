/**
 * Text in both game languages. The sim and the content tables use it, so every
 * message works for every player, whatever language they picked.
 */
export interface Loc {
  readonly de: string;
  readonly en: string;
}

export type Lang = keyof Loc;
export const LANGS: readonly Lang[] = ['de', 'en'];

/** German first, then English. */
export function L(de: string, en: string): Loc {
  return { de, en };
}

/** The same text in all languages (names, numbers). */
export function same(text: string): Loc {
  return { de: text, en: text };
}

/** Joins texts, language by language. */
export function joinLoc(parts: readonly Loc[], sep: string | Loc = ', '): Loc {
  const s = typeof sep === 'string' ? same(sep) : sep;
  return L(parts.map((p) => p.de).join(s.de), parts.map((p) => p.en).join(s.en));
}

/** True if the value is a Loc (old saves still have plain strings). */
export function isLoc(value: unknown): value is Loc {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Partial<Loc>).de === 'string' &&
    typeof (value as Partial<Loc>).en === 'string'
  );
}

type Var = string | number | Loc;

function pick(v: Var, lang: Lang): string {
  return typeof v === 'object' ? v[lang] : String(v);
}

/** Fills {name} places in both languages. A Loc value gives its own text per language. */
export function fmt(text: Loc, vars: Record<string, Var>): Loc {
  const one = (lang: Lang): string =>
    text[lang].replace(/\{(\w+)\}/g, (all, k: string) => {
      const v = vars[k];
      return v === undefined ? all : pick(v, lang);
    });
  return L(one('de'), one('en'));
}

/** An error with a text for the player in both languages. */
export class LocError extends Error {
  constructor(readonly text: Loc) {
    super(text.en);
  }
}
