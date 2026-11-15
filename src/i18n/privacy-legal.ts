import { L, type Loc } from '../content/text';

type Part = [title: Loc, lines: Loc[]];

/** The formal part of the privacy page (GDPR). The kid words come before it. */
export const PRIVACY_LEGAL: Part[] = [
  [
    L('Für Eltern', 'For parents'),
    [
      L(
        'Bitte lest diese Seite zusammen mit eurem Kind. Wer unter 16 ist, braucht für das Online-Spiel euer Einverständnis.',
        'Please read this page together with your child. Anyone under 16 needs your consent for the online game.',
      ),
      L(
        'In offenen Welten (in der Liste für alle) gibt es nur fertige Schnell-Nachrichten, keinen freien Text. Freien Text gibt es nur in Welten, die man per Link oder Code teilt.',
        'Open worlds (in the list for everyone) have only ready-made messages, no free text. Free text works only in worlds shared by link or code.',
      ),
      L(
        'Mit „Melden“ kommt eine Nachricht zum Betreiber. Er prüft sie und kann verwarnen oder ausschließen.',
        'With “Report” a message goes to the operator. The operator checks it and can warn or ban.',
      ),
    ],
  ],
  [
    L('Rechtliches (DSGVO)', 'Legal (GDPR)'),
    [
      L(
        'Verantwortlich ist der Betreiber von dom-builds.com. Name, Anschrift und E-Mail stehen im Impressum (Link unten).',
        'The operator of dom-builds.com is responsible. Name, address and e-mail are in the legal notice (link below).',
      ),
      L(
        'Spiel-Konto, Welten und Chat: damit du online spielen kannst (Art. 6 Abs. 1 lit. b DSGVO).',
        'Game account, worlds and chat: so that you can play online (Art. 6(1)(b) GDPR).',
      ),
      L(
        'Chat-Prüfung, Meldungen, Verwarnungen und Begrenzung der Anfragen: zum Schutz der Kinder und gegen Missbrauch (Art. 6 Abs. 1 lit. f DSGVO).',
        'Chat check, reports, warnings and request limits: to protect children and against abuse (Art. 6(1)(f) GDPR).',
      ),
      L(
        'Für die Begrenzung der Anfragen wird deine IP-Adresse kurz gezählt, aber nicht gespeichert.',
        'For the request limits your IP address is counted for a short time, but not stored.',
      ),
      L(
        'Der Browser-Speicher (Konto, Spielstand, Sprache) ist für das Spiel nötig (§ 25 Abs. 2 TDDDG). Keine Cookies.',
        'The browser storage (account, save game, language) is needed for the game (§ 25(2) TDDDG). No cookies.',
      ),
      L(
        'Besucher-Statistik mit OneDollarStats (Server in Finnland, EU): ohne Cookies, ohne Profil, nur zusammengezählt. Gezählt werden Seitenaufrufe, Herkunft (Land, verweisende Seite, Browser-Typ) und Spiel-Schritte wie „Spiel gestartet“ oder „Welt gebaut“, nie Namen oder Chat-Text. Zweck: das Spiel verbessern (Art. 6 Abs. 1 lit. f DSGVO).',
        'Visitor statistics with OneDollarStats (servers in Finland, EU): no cookies, no profile, only totals. It counts page views, origin (country, referring site, browser type) and game steps like “game started” or “world built”, never names or chat text. Purpose: to make the game better (Art. 6(1)(f) GDPR).',
      ),
      L(
        'Dienstleister: Cloudflare, Inc. (Hosting, Spiel-Server, KI-Chat-Prüfung) als Auftragsverarbeiter. Spiel-Daten liegen in der EU. Die KI-Prüfung kann auch außerhalb der EU laufen, sie bekommt nur den Text der Nachricht. Cloudflare ist unter dem EU-US Data Privacy Framework zertifiziert.',
        'Service provider: Cloudflare, Inc. (hosting, game server, AI chat check) as processor. Game data stays in the EU. The AI check can also run outside the EU; it gets only the text of the message. Cloudflare is certified under the EU-US Data Privacy Framework.',
      ),
      L(
        'Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit und Widerspruch. Eine Mail an den Betreiber genügt.',
        'You have the right to access, correction, deletion, restriction, data portability and objection. An e-mail to the operator is enough.',
      ),
      L(
        'Beschweren kannst du dich bei einer Datenschutz-Aufsichtsbehörde, zum Beispiel beim Hamburgischen Beauftragten für Datenschutz und Informationsfreiheit.',
        'You can complain to a data protection authority, for example the Hamburg Commissioner for Data Protection and Freedom of Information.',
      ),
    ],
  ],
];
