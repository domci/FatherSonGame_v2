import { L, type Loc } from './text';
/** Chat (M7): ready-made messages, punishments and the rules page. */

/** Ready-made messages: always allowed, no check needed. */
export const QUICK_MESSAGES = [
  L('Hallo!', 'Hello!'),
  L('Gutes Spiel!', 'Good game!'),
  L('Gut gemacht!', 'Well done!'),
  L('Danke!', 'Thanks!'),
  L('Hilfe, wir werden angegriffen!', 'Help, we are under attack!'),
  L('Wir greifen jetzt an!', 'We attack now!'),
  L('Lasst uns zusammen angreifen!', "Let's attack together!"),
  L('Wollen wir Frieden?', 'Shall we make peace?'),
  L('Wollen wir ein Bündnis?', 'Shall we make an alliance?'),
  L('Bis später!', 'See you later!'),
] as const;

/** Longest chat message (letters). */
export const CHAT_MAX = 160;
/** Lines kept per world, and how long. */
export const CHAT_KEEP = { lines: 100, ms: 7 * 24 * 60 * 60_000 } as const;
/** One message per this time per person. */
export const CHAT_GAP_MS = 2000;

/** Punishment by number of bad messages: warning, chat pause, then out of the game. */
export const STRIKES: readonly { banMs: number; out?: boolean; text: Loc }[] = [
  {
    banMs: 0,
    text: L(
      'Verwarnung: Diese Nachricht ist nicht erlaubt. Bitte halte dich an die Chat-Regeln.',
      'Warning: this message is not allowed. Please follow the chat rules.',
    ),
  },
  {
    banMs: 60 * 60_000,
    text: L(
      'Chat-Pause für 1 Stunde, weil du gegen die Regeln geschrieben hast.',
      'Chat pause for 1 hour, because you broke the rules.',
    ),
  },
  {
    banMs: 24 * 60 * 60_000,
    text: L(
      'Chat-Pause für 1 Tag, weil du wieder gegen die Regeln geschrieben hast.',
      'Chat pause for 1 day, because you broke the rules again.',
    ),
  },
  {
    banMs: 7 * 24 * 60 * 60_000,
    text: L(
      'Chat-Pause für 7 Tage. Beim nächsten Mal bist du raus.',
      'Chat pause for 7 days. Next time you are out.',
    ),
  },
  {
    banMs: 0,
    out: true,
    text: L(
      'Ausschluss: Du darfst nicht mehr online spielen.',
      'Banned: you may not play online any more.',
    ),
  },
];

/** The chat rules, short and for kids. */
export const CHAT_RULES = [
  L(
    'Sei freundlich. Keine Beleidigungen, kein Streit über echte Dinge.',
    'Be friendly. No insults, no fights about real things.',
  ),
  L(
    'Verrate nie echte Daten: keinen Namen, keine Adresse, keine Schule, keine Telefonnummer.',
    'Never tell real data: no name, no address, no school, no phone number.',
  ),
  L(
    'Keine Links, keine anderen Apps, keine Treffen außerhalb des Spiels.',
    'No links, no other apps, no meetings outside the game.',
  ),
  L(
    'Ein Computer prüft jede Nachricht, bevor andere sie sehen.',
    'A computer checks every message before others see it.',
  ),
  L(
    'Wer gegen die Regeln schreibt: Verwarnung, dann Chat-Pause, dann Ausschluss.',
    'Who breaks the rules gets: a warning, then a chat pause, then a ban.',
  ),
  L(
    'Etwas Komisches gesehen? Drück auf „Melden“. Deine Eltern sehen das.',
    'Saw something strange? Press “Report”. Your parents see it.',
  ),
] as const;
