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
  busy: L(
    'Gerade sind sehr viele da. Bitte versuch es später noch einmal.',
    'Very many people are here right now. Please try again later.',
  ),
  tooManyWorlds: L(
    'Du hast schon genug eigene Welten. Spiel in einer davon weiter.',
    'You already have enough own worlds. Keep playing in one of them.',
  ),
  quickOnly: L(
    'In offenen Welten gibt es nur Schnell-Nachrichten. Eigenen Text gibt es in Welten mit Link.',
    'Open worlds have only ready-made messages. Own text works in worlds with a link.',
  ),
  textBudget: L(
    'Du hast gerade viel geschrieben. Warte ein paar Minuten. Schnell-Nachrichten gehen.',
    'You wrote a lot just now. Wait a few minutes. Ready-made messages work.',
  ),
} as const;
