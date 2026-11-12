/** Chat (M7): ready-made messages, punishments and the rules page. */

/** Ready-made messages: always allowed, no check needed. */
export const QUICK_MESSAGES = [
  'Hallo!',
  'Gutes Spiel!',
  'Gut gemacht!',
  'Danke!',
  'Hilfe, wir werden angegriffen!',
  'Wir greifen jetzt an!',
  'Lasst uns zusammen angreifen!',
  'Wollen wir Frieden?',
  'Wollen wir ein Bündnis?',
  'Bis später!',
] as const;

/** Longest chat message (letters). */
export const CHAT_MAX = 160;
/** Lines kept per world, and how long. */
export const CHAT_KEEP = { lines: 100, ms: 7 * 24 * 60 * 60_000 } as const;
/** One message per this time per person. */
export const CHAT_GAP_MS = 2000;

/** Punishment by number of bad messages: warning, chat pause, then out of the game. */
export const STRIKES: readonly { banMs: number; out?: boolean; text: string }[] = [
  {
    banMs: 0,
    text: 'Verwarnung: Diese Nachricht ist nicht erlaubt. Bitte halte dich an die Chat-Regeln.',
  },
  {
    banMs: 60 * 60_000,
    text: 'Chat-Pause für 1 Stunde, weil du gegen die Regeln geschrieben hast.',
  },
  {
    banMs: 24 * 60 * 60_000,
    text: 'Chat-Pause für 1 Tag, weil du wieder gegen die Regeln geschrieben hast.',
  },
  { banMs: 7 * 24 * 60 * 60_000, text: 'Chat-Pause für 7 Tage. Beim nächsten Mal bist du raus.' },
  { banMs: 0, out: true, text: 'Ausschluss: Du darfst nicht mehr online spielen.' },
];

/** The chat rules, short and for kids. */
export const CHAT_RULES = [
  'Sei freundlich. Keine Beleidigungen, kein Streit über echte Dinge.',
  'Verrate nie echte Daten: keinen Namen, keine Adresse, keine Schule, keine Telefonnummer.',
  'Keine Links, keine anderen Apps, keine Treffen außerhalb des Spiels.',
  'Ein Computer prüft jede Nachricht, bevor andere sie sehen.',
  'Wer gegen die Regeln schreibt: Verwarnung, dann Chat-Pause, dann Ausschluss.',
  'Etwas Komisches gesehen? Drück auf „Melden“. Deine Eltern sehen das.',
] as const;
