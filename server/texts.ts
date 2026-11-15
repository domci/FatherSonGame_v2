import { L } from '../src/content/text';

/** Messages from the world server to the players, in both languages. */
export const SERVER_TEXT = {
  gone: L('Diese Welt gibt es nicht mehr.', 'This world does not exist any more.'),
  reload: L(
    'Es gibt eine neue Version. Bitte neu laden.',
    'There is a new version. Please reload.',
  ),
  noAccount: L('Dieses Konto gibt es nicht.', 'This account does not exist.'),
  banned: L('Du darfst nicht mehr online spielen.', 'You may not play online any more.'),
  full: L('In dieser Welt ist kein Platz mehr frei.', 'There is no free seat in this world.'),
  tooFast: L('Nicht so schnell.', 'Not so fast.'),
  thanks: L('Danke! Deine Meldung ist angekommen.', 'Thanks! Your report has arrived.'),
  notAllowed: L('Diese Nachricht ist nicht erlaubt.', 'This message is not allowed.'),
  noCheck: L(
    'Die Chat-Prüfung geht gerade nicht. Nutzt die Schnell-Nachrichten.',
    'The chat check does not work right now. Use the ready-made messages.',
  ),
  chatPause: L(
    'Chat-Pause noch {t}. Schnell-Nachrichten gehen.',
    'Chat pause for {t} more. Ready-made messages work.',
  ),
} as const;
