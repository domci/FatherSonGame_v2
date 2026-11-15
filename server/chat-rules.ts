import { CHAT_MAX } from '../src/content/chat';
import { L, fmt, type Loc } from '../src/content/text';

/** Words that are never allowed (insults, contact and meeting words). Lower case, without umlauts. */
const BAD_WORDS = [
  'idiot',
  'depp',
  'doof',
  'dumm',
  'blod',
  'arsch',
  'scheis',
  'kacke',
  'hure',
  'fick',
  'fuck',
  'shit',
  'bitch',
  'wichser',
  'spast',
  'behindert',
  'missgeburt',
  'opfer',
  'schwuchtel',
  'nazi',
  'hitler',
  'kill dich',
  'stirb',
  'hass dich',
  'loser',
  'penner',
  'fresse',
  'halts maul',
];
const CONTACT_WORDS = [
  'whatsapp',
  'snapchat',
  'insta',
  'tiktok',
  'discord',
  'telegram',
  'skype',
  'youtube',
  'telefon',
  'handy',
  'nummer',
  'adresse',
  'strasse',
  'wohne',
  'wohnst',
  'schule',
  'email',
  'e-mail',
  'mail',
  'passwort',
  'password',
  'treffen',
  'wie alt',
  'echter name',
  'foto',
  'bild von dir',
];

/** Lower case, umlauts and look-alike digits replaced ("4rsch" → "arsch"). */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ß/g, 'ss')
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/@/g, 'a')
    .replace(/\$/g, 's')
    .replace(/[^a-z ]/g, '')
    .replace(/\s+/g, ' ');
}

/** A rule problem: the text, and whether it counts as breaking the rules (strike). */
export interface RuleProblem {
  text: Loc;
  strike: boolean;
}

function form(text: string): RuleProblem | undefined {
  if (!text) return { text: L('Die Nachricht ist leer.', 'The message is empty.'), strike: false };
  if (text.length > CHAT_MAX)
    return {
      text: fmt(L('Höchstens {n} Zeichen.', 'At most {n} letters.'), { n: CHAT_MAX }),
      strike: false,
    };
  return undefined;
}

/** Why a chat text is not allowed (undefined = the simple rules are fine). */
export function checkRules(raw: string): RuleProblem | undefined {
  const text = raw.trim();
  const bad = (t: Loc): RuleProblem => ({ text: t, strike: true });
  const problem = form(text);
  if (problem) return problem;
  if (/https?:|www\.|\.(de|com|net|org)\b|@\w/i.test(text))
    return bad(L('Keine Links und keine Adressen.', 'No links and no addresses.'));
  if ((text.match(/\d/g) ?? []).length > 4)
    return bad(
      L('Keine Nummern (zum Beispiel Telefonnummern).', 'No numbers (for example phone numbers).'),
    );
  const flat = normalize(text);
  const squeezed = flat.replace(/ /g, '');
  if (BAD_WORDS.some((w) => flat.includes(w) || squeezed.includes(w.replace(/ /g, ''))))
    return bad(L('Bitte sei freundlich.', 'Please be friendly.'));
  if (CONTACT_WORDS.some((w) => flat.includes(w)))
    return bad(L('Keine echten Daten und keine anderen Apps.', 'No real data and no other apps.'));
  return undefined;
}
