import type { Loc } from '../../content/text';

export const PARENTS = {
  isOk: { de: 'Ist okay', en: 'It is okay' },
  closeReport: { de: 'Meldung schließen.', en: 'Close the report.' },
  warn: { de: 'Verwarnen', en: 'Warn' },
  warnHelp: {
    de: 'Wie eine schlimme Nachricht: Verwarnung, dann Chat-Pause.',
    en: 'Like a bad message: warning, then chat pause.',
  },
  ban: { de: 'Sperren', en: 'Ban' },
  banHelp: { de: 'Darf nicht mehr online spielen.', en: 'May not play online any more.' },
  worldN: { de: '{w} · Welt {n}', en: '{w} · world {n}' },
  noReports: { de: 'Keine offenen Meldungen.', en: 'No open reports.' },
  password: { de: 'Passwort', en: 'Password' },
  forParents: { de: 'Für Eltern', en: 'For parents' },
  reports: { de: 'Meldungen', en: 'Reports' },
  parentsHelp: {
    de: 'Hier stehen Chat-Nachrichten, die Kinder gemeldet haben. Das Passwort ist der ADMIN_KEY des Servers.',
    en: "Here are chat messages that kids have reported. The password is the server's ADMIN_KEY.",
  },
  show: { de: 'Zeigen', en: 'Show' },
  close2: { de: 'Schließen', en: 'Close' },
} as const satisfies Record<string, Loc>;
