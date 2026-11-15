import type { Loc } from '../../content/text';

export const MENU = {
  mContinue: { de: 'Weiterspielen', en: 'Continue' },
  mNewGame: { de: 'Neues Spiel', en: 'New game' },
  mOnline: { de: 'Online spielen', en: 'Play online' },
  mLoad: { de: 'Spielstand laden', en: 'Load saved game' },
  mKicker: { de: 'Ein Weltraum-Strategiespiel', en: 'A space strategy game' },
  mTitle: { de: 'Crashlanded', en: 'Crashlanded' },
  mLead: {
    de: 'Euer Schiff ist abgestürzt. Baut eine Kuppel-Basis, holt Rohstoffe aus dem All und behauptet euch gegen Spinnenwesen und Aliens.',
    en: 'Your ship has crashed. Build a dome base, gather resources from space and stand your ground against spider creatures and aliens.',
  },
  mFoot: {
    de: 'Spielt als Menschen oder als Aliens  ·  Für Kinder ab 10',
    en: 'Play as humans or as aliens  ·  For kids 10+',
  },
  pSub: { de: 'Pause', en: 'Pause' },
  pMenu: { de: 'Menü', en: 'Menu' },
  pResume: { de: 'Weiter', en: 'Resume' },
  pSave: { de: 'Jetzt speichern', en: 'Save now' },
  pExport: { de: 'Spielstand als Datei', en: 'Save game as file' },
  pQuit: { de: 'Zum Hauptmenü', en: 'To main menu' },
  pSettings: { de: 'Einstellungen', en: 'Settings' },
  pAutoSave: {
    de: 'Das Spiel speichert alle 2 Minuten von selbst.',
    en: 'The game saves by itself every 2 minutes.',
  },
  pServerSave: {
    de: 'Die Welt läuft weiter, auch wenn du weg bist. Der Server speichert sie.',
    en: 'The world keeps running while you are away. The server saves it.',
  },
  loading: { de: 'Landeanflug …', en: 'Landing approach …' },
  opp1: { de: 'Ihr gegen ein anderes Volk.', en: 'You against one other people.' },
  opp2: {
    de: 'Drei Völker: Frieden und Bündnisse werden wichtig.',
    en: 'Three peoples: peace and alliances become important.',
  },
  opp3: {
    de: 'Vier Völker in einem großen Sonnensystem.',
    en: 'Four peoples in a big solar system.',
  },
  oppCount: { de: 'Anzahl der Gegner', en: 'Number of opponents' },
  oppLevel: { de: 'Stärke der Gegner', en: 'Strength of opponents' },
  letsGo: { de: "Los geht's", en: "Let's go" },
  offlineAtk: { de: 'Angriffe, auch wenn keiner spielt', en: 'Attacks, even when nobody plays' },
  offlineAtkHelp: {
    de: 'Aus: Die Gegner greifen nur an, wenn ihr spielt.',
    en: 'Off: opponents only attack while you play.',
  },
  opponents: { de: 'Gegner', en: 'Opponents' },
  newGameSub: { de: 'Neues Spiel', en: 'New game' },
  language: { de: 'Sprache', en: 'Language' },
} as const satisfies Record<string, Loc>;
