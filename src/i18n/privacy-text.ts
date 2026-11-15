import { CHAT_KEEP } from '../content/chat';
import { fmt, L, type Loc } from '../content/text';

type Part = [title: Loc, lines: Loc[]];

const DAYS = Math.round(CHAT_KEEP.ms / 86_400_000);

/** The privacy page in words for kids, with a part for parents. */
export const PRIVACY_PARTS: Part[] = [
  [
    L('Was wir speichern', 'What we store'),
    [
      L(
        'Deinen Spielnamen, zum Beispiel „Roter Falke 7“. Du suchst ihn aus einer Liste aus.',
        'Your game name, for example “Red Falcon 7”. You choose it from a list.',
      ),
      L(
        'Eine Konto-Nummer und einen geheimen Schlüssel. Auf dem Server liegt nur eine Prüfsumme des Schlüssels.',
        'An account number and a secret key. The server keeps only a checksum of the key.',
      ),
      L(
        'Die Welten, in denen du spielst, und was in diesen Welten passiert (Gebäude, Einheiten, Rohstoffe).',
        'The worlds you play in, and what happens in these worlds (buildings, units, resources).',
      ),
      fmt(
        L(
          'Chat-Nachrichten: höchstens {n} pro Welt, und nur {d} Tage lang.',
          'Chat messages: at most {n} per world, and only for {d} days.',
        ),
        { n: CHAT_KEEP.lines, d: DAYS },
      ),
      L(
        'Verwarnungen und Chat-Pausen, wenn jemand gegen die Regeln schreibt.',
        'Warnings and chat pauses, when someone breaks the rules.',
      ),
      L(
        'Meldungen, bis deine Eltern sie angesehen haben.',
        'Reports, until your parents have looked at them.',
      ),
    ],
  ],
  [
    L('Was wir nie speichern', 'What we never store'),
    [
      L(
        'Keinen echten Namen, keine E-Mail, kein Passwort, keine Telefonnummer, keine Adresse.',
        'No real name, no e-mail, no password, no phone number, no address.',
      ),
      L(
        'Keine Werbung, keine Werbe-Cookies, kein Verfolgen über andere Webseiten.',
        'No ads, no ad cookies, no tracking across other websites.',
      ),
    ],
  ],
  [
    L('Wo die Daten liegen', 'Where the data is'),
    [
      L(
        'Auf deinem Gerät: dein Konto (Nummer, Schlüssel, Name) im Speicher des Browsers.',
        'On your device: your account (number, key, name) in the browser storage.',
      ),
      L(
        'Auf dem Server: bei Cloudflare, Spiel-Daten in der EU.',
        'On the server: at Cloudflare, game data in the EU.',
      ),
      L(
        'Jede eigene Chat-Nachricht prüft ein Computer-Programm (KI) bei Cloudflare, bevor andere sie sehen. Es bekommt nur den Text, nicht deinen Namen.',
        'A computer program (AI) at Cloudflare checks each of your own chat messages before others see it. It only gets the text, not your name.',
      ),
      L(
        'Wie bei jeder Webseite sieht der Server deine Internet-Adresse (IP), um dir zu antworten. Das Spiel speichert sie nicht.',
        'Like with every website, the server sees your internet address (IP) to answer you. The game does not store it.',
      ),
    ],
  ],
  [
    L('Löschen', 'Deleting'),
    [
      L(
        'In der Lobby: „Konto löschen“. Dann sind Name, Schlüssel und deine Plätze in den Welten sofort weg.',
        'In the lobby: “Delete account”. Then name, key and your seats in the worlds are gone at once.',
      ),
      fmt(
        L(
          'Alte Chat-Nachrichten verschwinden spätestens nach {d} Tagen.',
          'Old chat messages disappear after {d} days at the latest.',
        ),
        { d: DAYS },
      ),
      L(
        'Nur Online-Spiele brauchen ein Konto. Allein spielen geht ganz ohne.',
        'Only online games need an account. Playing alone works without one.',
      ),
    ],
  ],
  [
    L('Für Eltern', 'For parents'),
    [
      L(
        'Dieses Spiel betreibt eine Familie für Familie und Freunde. Fragen? Sprecht die Person an, die euch den Link gegeben hat.',
        'A family runs this game for family and friends. Questions? Talk to the person who gave you the link.',
      ),
      L(
        'Bitte lest diese Seite zusammen mit eurem Kind. Wer unter 16 ist, braucht für das Online-Spiel euer Einverständnis.',
        'Please read this page together with your child. Anyone under 16 needs your consent for the online game.',
      ),
      L(
        'Gemeldete Nachrichten seht ihr auf der Eltern-Seite (Adresse mit #eltern am Ende, mit Passwort).',
        'You see reported messages on the parents page (address with #eltern at the end, with password).',
      ),
    ],
  ],
];
