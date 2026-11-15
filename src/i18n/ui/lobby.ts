import type { Loc } from '../../content/text';

export const LOBBY = {
  worldInfo: {
    de: '{d} · {t} Menschen · Code {c}',
    en: '{d} · {t} humans · code {c}',
  },
  hello: { de: 'Hallo, {n}!', en: 'Hello, {n}!' },
  yourWorlds: { de: 'Deine Welten', en: 'Your worlds' },
  play: { de: 'Spielen', en: 'Play' },
  noWorlds: {
    de: 'Noch keine. Mach eine neue Welt oder tritt einer bei.',
    en: 'None yet. Make a new world or join one.',
  },
  newWorld: { de: 'Neue Welt', en: 'New world' },
  openWorlds: { de: 'Offene Welten', en: 'Open worlds' },
  joinBtn: { de: 'Beitreten', en: 'Join' },
  noOpen: {
    de: 'Gerade keine. Frag Freunde nach dem Link zu ihrer Welt.',
    en: 'None right now. Ask friends for the link to their world.',
  },
  joinCode: { de: 'Mit Code beitreten', en: 'Join with code' },
  yourAccount: { de: 'Dein Konto', en: 'Your account' },
  otherDev: { de: 'Anderes Gerät', en: 'Other device' },
  deleteAcc: { de: 'Konto löschen', en: 'Delete account' },
  back: { de: 'Zurück', en: 'Back' },
  c0: { de: 'Nur Menschen.', en: 'Only humans.' },
  c1: { de: 'Dazu ein Computer-Volk.', en: 'Plus one computer people.' },
  c2: { de: 'Dazu zwei Computer-Völker.', en: 'Plus two computer peoples.' },
  worldOf: { de: 'Welt von {n}', en: 'World of {n}' },
  chooseFaction: { de: 'Wählt euer Volk', en: 'Choose your people' },
  computer: { de: 'Computer', en: 'Computer' },
  growHelp: {
    de: 'Freunde kommen mit dem Link zur Welt. Für jeden neuen Spieler kommt ein Planet dazu (bis {n} Völker).',
    en: 'Friends come with the link to the world. Each new player gets a new planet (up to {n} peoples).',
  },
  nComputers: { de: '{n} Computer', en: '{n} computers' },
  invite: { de: 'Freunde einladen', en: 'Invite friends' },
  inviteBtn: { de: 'Einladen', en: 'Invite' },
  shCopied: {
    de: 'Kopiert! Schick den Link jetzt deinen Freunden.',
    en: 'Copied! Now send the link to your friends.',
  },
  shMarked: {
    de: 'Markiert. Kopiere den Link mit Strg+C (oder lange tippen).',
    en: 'Selected. Copy the link with Ctrl+C (or long press).',
  },
  shCode: { de: 'Welt-Code: {c}', en: 'World code: {c}' },
  shText: { de: 'Komm in meine Welt „{n}“!', en: 'Come to my world “{n}”!' },
  shHelp: {
    de: 'Wer diesen Link öffnet, kann eurer Welt beitreten. Ist sie voll, kommt ein neuer Planet dazu.',
    en: 'Who opens this link can join your world. If it is full, a new planet comes.',
  },
  shCopy: { de: 'Kopieren', en: 'Copy' },
  shShare: { de: 'Teilen …', en: 'Share …' },
  shSafe: {
    de: 'Gib den Link nur Leuten, die du kennst. Neue Spieler haben 3 Tage Schutz.',
    en: 'Give the link only to people you know. New players have 3 days of protection.',
  },
  shDone: { de: 'Fertig', en: 'Done' },
  openAll: { de: 'Offen für alle', en: 'Open for everyone' },
  openHelp: {
    de: 'An: Jeder sieht die Welt in der Liste, Chat nur mit Schnell-Nachrichten. Aus: Nur wer den Link oder Code hat.',
    en: 'On: everyone sees the world in the list, chat only with ready-made messages. Off: only who has the link or code.',
  },
  buildWorld: { de: 'Welt bauen', en: 'Build world' },
  joinTitle: { de: 'Beitreten: {n}', en: 'Join: {n}' },
  shield3: {
    de: 'Neue Spieler haben 3 Tage Schutz: In der Zeit kann euch kein Mensch angreifen.',
    en: 'New players have 3 days of protection: in that time no human can attack you.',
  },
} as const satisfies Record<string, Loc>;
