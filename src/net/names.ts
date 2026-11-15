/**
 * Player names are made from these words only (no free text: kids never type a real name).
 * "Roter Falke", "Mutiger Komet", …
 */
export const NAME_WORDS = {
  first: [
    'Roter',
    'Blauer',
    'Grüner',
    'Goldener',
    'Silberner',
    'Schneller',
    'Mutiger',
    'Stiller',
    'Kluger',
    'Wilder',
    'Heller',
    'Dunkler',
    'Flinker',
    'Starker',
    'Kleiner',
    'Großer',
  ],
  second: [
    'Falke',
    'Komet',
    'Stern',
    'Mond',
    'Drache',
    'Fuchs',
    'Wolf',
    'Adler',
    'Blitz',
    'Pilot',
    'Kapitän',
    'Forscher',
    'Roboter',
    'Meteor',
    'Nebel',
    'Planet',
    'Krater',
    'Laser',
  ],
} as const;

/** The same idea in English: "Red Falcon", "Brave Comet", … */
export const NAME_WORDS_EN = {
  first: ['Red', 'Blue', 'Green', 'Golden', 'Silver', 'Swift', 'Brave', 'Silent', 'Clever', 'Wild'],
  second: ['Falcon', 'Comet', 'Star', 'Moon', 'Dragon', 'Fox', 'Wolf', 'Eagle', 'Pilot', 'Rocket'],
} as const;

type Words = { readonly first: readonly string[]; readonly second: readonly string[] };
const WORDS: Record<'de' | 'en', Words> = { de: NAME_WORDS, en: NAME_WORDS_EN };

/** A name like "Roter Falke 7" or "Red Falcon 7" (number so that names differ). */
export function makeName(random: () => number, lang: 'de' | 'en' = 'de'): string {
  const pick = (list: readonly string[]): string =>
    list[Math.floor(random() * list.length)] ?? list[0] ?? '';
  const w = WORDS[lang];
  return `${pick(w.first)} ${pick(w.second)} ${1 + Math.floor(random() * 99)}`;
}

/** Only names from the word lists are allowed (both words from the same language). */
export function isGoodName(name: string): boolean {
  const m = /^(\S+) (\S+) ([1-9]\d?)$/.exec(name);
  if (!m) return false;
  const [, a = '', b = ''] = m;
  return Object.values(WORDS).some((w) => w.first.includes(a) && w.second.includes(b));
}
