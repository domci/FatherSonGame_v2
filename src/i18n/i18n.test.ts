import { describe, expect, it } from 'vitest';
import { fmt, isLoc, joinLoc, L, LocError, same } from '../content/text';
import { isGoodName, makeName } from '../net/names';
import { migrate } from '../sim/save/migrations';
import { CATALOGS, UI } from './catalog';
import { errorText, fill, lang, setLang, t, tx } from './index';

describe('two languages', () => {
  it('every UI text has German and English, and no key is used twice', () => {
    const keys = CATALOGS.flatMap((c) => Object.keys(c));
    expect(new Set(keys).size).toBe(keys.length);
    for (const [key, text] of Object.entries(UI)) {
      expect(text.de.trim(), key).not.toBe('');
      expect(text.en.trim(), key).not.toBe('');
    }
  });

  it('fills places in both languages, also with texts', () => {
    const name = L('Labor', 'Lab');
    expect(fmt(L('{b} fertig ({n}).', '{b} done ({n}).'), { b: name, n: 2 })).toEqual({
      de: 'Labor fertig (2).',
      en: 'Lab done (2).',
    });
    expect(joinLoc([L('Wasser', 'Water'), same('Gas')])).toEqual(L('Wasser, Gas', 'Water, Gas'));
    expect(isLoc(L('a', 'b'))).toBe(true);
    expect(isLoc('a')).toBe(false);
    expect(fill('{a} und {b}', { a: 1 })).toBe('1 und {b}');
  });

  it('switches the language of t and tx', () => {
    setLang('de');
    expect(lang()).toBe('de');
    expect(t('mNewGame')).toBe('Neues Spiel');
    expect(tx(L('Ja', 'Yes'))).toBe('Ja');
    expect(errorText(new LocError(L('Kaputt', 'Broken')))).toBe('Kaputt');
    setLang('en');
    expect(t('hello', { n: 'Red Fox 3' })).toBe('Hello, Red Fox 3!');
    expect(errorText(new Error('plain'))).toBe('plain');
  });

  it('old saves get both languages for their news lines', () => {
    const data = migrate({ version: 4, events: [{ time: 1, text: 'Alt', kind: 'info' }] });
    expect(data.events[0]?.text).toEqual({ de: 'Alt', en: 'Alt' });
  });

  it('makes player names in both languages; the server takes both', () => {
    const en = makeName(() => 0.5, 'en');
    expect(en).toMatch(/^[A-Z][a-z]+ [A-Z][a-z]+ \d+$/);
    expect(isGoodName(en)).toBe(true);
    expect(isGoodName(makeName(() => 0.1, 'de'))).toBe(true);
    expect(isGoodName('Red Falke 3')).toBe(false);
  });
});
