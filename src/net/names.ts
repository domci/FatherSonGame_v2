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

/** A name like "Roter Falke 7" (number so that names differ). */
export function makeName(random: () => number): string {
  const pick = (list: readonly string[]): string =>
    list[Math.floor(random() * list.length)] ?? list[0] ?? '';
  return `${pick(NAME_WORDS.first)} ${pick(NAME_WORDS.second)} ${1 + Math.floor(random() * 99)}`;
}

/** Only names from the word lists are allowed. */
export function isGoodName(name: string): boolean {
  const m = /^(\S+) (\S+) ([1-9]\d?)$/.exec(name);
  if (!m) return false;
  const [, a = '', b = ''] = m;
  return (
    (NAME_WORDS.first as readonly string[]).includes(a) &&
    (NAME_WORDS.second as readonly string[]).includes(b)
  );
}
