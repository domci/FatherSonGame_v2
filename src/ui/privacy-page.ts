import { CHAT_KEEP } from '../content/chat';
import { el } from './dom';
import { icon } from './icons';

type Part = [title: string, lines: string[]];

const DAYS = Math.round(CHAT_KEEP.ms / 86_400_000);

/** The privacy page in words for kids, with a part for parents. */
const PARTS: Part[] = [
  [
    'Was wir speichern',
    [
      'Deinen Spielnamen, zum Beispiel „Roter Falke 7“. Du suchst ihn aus einer Liste aus.',
      'Eine Konto-Nummer und einen geheimen Schlüssel. Auf dem Server liegt nur eine Prüfsumme des Schlüssels.',
      'Die Welten, in denen du spielst, und was in diesen Welten passiert (Gebäude, Einheiten, Rohstoffe).',
      `Chat-Nachrichten: höchstens ${CHAT_KEEP.lines} pro Welt, und nur ${DAYS} Tage lang.`,
      'Verwarnungen und Chat-Pausen, wenn jemand gegen die Regeln schreibt.',
      'Meldungen, bis deine Eltern sie angesehen haben.',
    ],
  ],
  [
    'Was wir nie speichern',
    [
      'Keinen echten Namen, keine E-Mail, kein Passwort, keine Telefonnummer, keine Adresse.',
      'Keine Werbung, keine Werbe-Cookies, kein Verfolgen über andere Webseiten.',
    ],
  ],
  [
    'Wo die Daten liegen',
    [
      'Auf deinem Gerät: dein Konto (Nummer, Schlüssel, Name) im Speicher des Browsers.',
      'Auf dem Server: bei Cloudflare, Spiel-Daten in der EU.',
      'Jede eigene Chat-Nachricht prüft ein Computer-Programm (KI) bei Cloudflare, bevor andere sie sehen. Es bekommt nur den Text, nicht deinen Namen.',
      'Wie bei jeder Webseite sieht der Server deine Internet-Adresse (IP), um dir zu antworten. Das Spiel speichert sie nicht.',
    ],
  ],
  [
    'Löschen',
    [
      'In der Lobby: „Konto löschen“. Dann sind Name, Schlüssel und deine Plätze in den Welten sofort weg.',
      `Alte Chat-Nachrichten verschwinden spätestens nach ${DAYS} Tagen.`,
      'Nur Online-Spiele brauchen ein Konto. Allein spielen geht ganz ohne.',
    ],
  ],
  [
    'Für Eltern',
    [
      'Dieses Spiel betreibt eine Familie für Familie und Freunde. Fragen? Sprecht die Person an, die euch den Link gegeben hat.',
      'Bitte lest diese Seite zusammen mit eurem Kind. Wer unter 16 ist, braucht für das Online-Spiel euer Einverständnis.',
      'Gemeldete Nachrichten seht ihr auf der Eltern-Seite (Adresse mit #eltern am Ende, mit Passwort).',
    ],
  ],
];

/** "Datenschutz": what the online game keeps, and what it never keeps. */
export function privacyPage(onClose: () => void): HTMLElement {
  return el(
    'div',
    { class: 'screen modal info-page' },
    el(
      'div',
      { class: 'panel dialog wide' },
      el('div', { class: 'p-sub' }, 'Datenschutz'),
      el('h2', {}, 'Deine Daten'),
      ...PARTS.flatMap(([title, lines]) => [
        el('h4', { class: 'dlg-h' }, title),
        el('ul', { class: 'log' }, ...lines.map((l) => el('li', {}, l))),
      ]),
      el(
        'button',
        { class: 'm-item primary', onclick: () => onClose() },
        icon('check'),
        el('span', {}, 'Verstanden'),
      ),
    ),
  );
}
