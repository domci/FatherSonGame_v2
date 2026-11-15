import type { Loc } from '../../content/text';

export const APP = {
  free: { de: 'gratis', en: 'free' },
  durD: { de: '{d} T {h} Std', en: '{d} d {h} h' },
  durH: { de: '{h} Std {m} Min', en: '{h} h {m} min' },
  durM: { de: '{m} Min {s} Sek', en: '{m} min {s} s' },
  durS: { de: '{s} Sek', en: '{s} s' },
  sounds: { de: 'Geräusche', en: 'Sounds' },
  soundsHelp: { de: 'Laser, Explosionen, Klicks', en: 'Lasers, explosions, clicks' },
  music: { de: 'Musik', en: 'Music' },
  musicHelp: { de: 'Ruhige Klänge, Kampfmusik', en: 'Calm sounds, battle music' },
  saved: { de: 'Gespeichert.', en: 'Saved.' },
  code24: {
    de: 'Der Code hat 24 Zeichen. Bitte genau abschreiben.',
    en: 'The code has 24 characters. Please copy it exactly.',
  },
  accGone: {
    de: 'Dein Konto gibt es nicht mehr. Wähle einen neuen Namen.',
    en: 'Your account does not exist any more. Choose a new name.',
  },
  connecting: { de: 'Verbinde …', en: 'Connecting …' },
  buildingWorld: { de: 'Baue die Welt …', en: 'Building the world …' },
  deleteAccText: {
    de: '„{n}“ wird gelöscht, mit allen Chat-Sperren und Plätzen in Welten. Das geht nicht rückgängig.',
    en: '“{n}” will be deleted, with all chat bans and seats in worlds. This cannot be undone.',
  },
  delete: { de: 'Löschen', en: 'Delete' },
} as const satisfies Record<string, Loc>;
