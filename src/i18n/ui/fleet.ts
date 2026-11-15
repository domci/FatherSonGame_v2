import type { Loc } from '../../content/text';

export const FLEET = {
  fleetHere: { de: 'Eure Flotte hier', en: 'Your fleet here' },
  friendsOrbit: { de: 'Freunde im Orbit', en: 'Friends in orbit' },
  comingHere: { de: 'Unterwegs hierher', en: 'On the way here' },
  enemiesOrbit: { de: 'Feinde im Orbit', en: 'Enemies in orbit' },
  blockade: {
    de: 'Blockade: Mining- und Transportschiffe werden hier beschossen.',
    en: 'Blockade: mining and transport ships are shot at here.',
  },
  sendFleet: { de: 'Flotte hierher schicken ({n} Schiffe)', en: 'Send fleet here ({n} ships)' },
  sendFleetHelp: {
    de: 'Alle wartenden Kampfschiffe fliegen hierher.',
    en: 'All waiting warships fly here.',
  },
  noWarships: {
    de: 'Keine freien Kampfschiffe. Baut welche im Raumhafen.',
    en: 'No free warships. Build some in the spaceport.',
  },
  planet: { de: 'Planet', en: 'Planet' },
  flyHome: { de: 'Nach Hause fliegen', en: 'Fly home' },
  attackFly: { de: 'Angriff: zu {p} fliegen', en: 'Attack: fly to {p}' },
  landAt: { de: 'Die Truppen landen bei {n}.', en: 'The troops land at {n}.' },
  boardFirst: { de: 'Erst Truppen einsteigen lassen.', en: 'Let troops board first.' },
  aboard: { de: 'An Bord', en: 'On board' },
  flyingTo: { de: 'Fliegt zu {p}', en: 'Flying to {p}' },
  unloadAll: { de: 'Alle aussteigen', en: 'Everybody out' },
  boardHelp: {
    de: 'Einsteigen: Truppen wählen, dann auf das Schiff tippen.',
    en: 'To board: select troops, then tap the ship.',
  },
  boardShip: { de: 'In Transportschiff #{n} einsteigen', en: 'Board transport ship #{n}' },
  finishNow: { de: 'Sofort fertig machen', en: 'Finish now' },
  finishNowHelp: {
    de: 'Mit Wissenskristallen aus dem Quiz sofort fertig machen',
    en: 'Finish now with knowledge crystals from the quiz',
  },
} as const satisfies Record<string, Loc>;
