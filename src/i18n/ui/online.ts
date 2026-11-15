import type { Loc } from '../../content/text';

export const ONLINE = {
  toAll: { de: 'Alle', en: 'All' },
  toAllies: { de: 'Verbündete', en: 'Allies' },
  toPrivate: { de: 'Privat', en: 'Private' },
  chat: { de: 'Chat', en: 'Chat' },
  msgPh: { de: 'Nachricht …', en: 'Message …' },
  toWho: { de: 'An: {w}', en: 'To: {w}' },
  chatRules: { de: 'Chat-Regeln', en: 'Chat rules' },
  report: { de: 'Melden', en: 'Report' },
  send: { de: 'Senden', en: 'Send' },
  privacyLink: { de: 'Datenschutz: was wir speichern', en: 'Privacy: what we store' },
  playOnline: { de: 'Online spielen', en: 'Play online' },
  pickName: { de: 'Wähle deinen Namen', en: 'Choose your name' },
  nameHelp: {
    de: 'Online heißt du nicht wie im echten Leben. Such dir einen Spielnamen aus. Wir fragen nicht nach E-Mail oder Passwort.',
    en: 'Online you do not use your real name. Choose a game name. We do not ask for e-mail or password.',
  },
  otherNames: { de: 'Andere Namen', en: 'Other names' },
  haveAccount: {
    de: 'Schon ein Konto auf einem anderen Gerät?',
    en: 'Already have an account on another device?',
  },
  login: { de: 'Anmelden', en: 'Log in' },
  account: { de: 'Konto', en: 'Account' },
  otherDevice: { de: 'Auf anderem Gerät spielen', en: 'Play on another device' },
  codeHelp: {
    de: 'Gib diesen Code auf dem anderen Gerät ein: „Online spielen“, dann „Anmelden“.',
    en: 'Enter this code on the other device: “Play online”, then “Log in”.',
  },
  copy: { de: 'Kopieren', en: 'Copy' },
  codeSecret: {
    de: 'Halte den Code geheim. Er ist wie ein Schlüssel: Wer ihn hat, spielt mit deinem Konto.',
    en: 'Keep the code secret. It is like a key: whoever has it plays with your account.',
  },
  done: { de: 'Fertig', en: 'Done' },
  sure: { de: 'Bist du sicher?', en: 'Are you sure?' },
  privacy: { de: 'Datenschutz', en: 'Privacy' },
  yourData: { de: 'Deine Daten', en: 'Your data' },
  understood: { de: 'Verstanden', en: 'Got it' },
} as const satisfies Record<string, Loc>;
