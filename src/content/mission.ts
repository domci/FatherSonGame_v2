import type { BuildingId } from './buildings';
import type { Faction } from './factions';
import type { ResourceAmounts } from './resources';
import { L } from './text';
import type { Loc } from './text';

/** What a mission step wants. The UI writes the title from it (with the faction's names). */
export type MissionGoal =
  | { kind: 'build'; building: BuildingId }
  | { kind: 'people'; count: number }
  | { kind: 'research' }
  | { kind: 'quiz' };

export interface MissionStep {
  goal: MissionGoal;
  /** Why and how, in one or two short sentences. {b:lab} = the faction's name of a building. */
  hint: Loc;
  reward: ResourceAmounts;
}

export const MISSION_NAME = L('Überleben', 'Survive');

/** The first mission: from the crash to a small, safe colony. */
export const MISSION: readonly MissionStep[] = [
  {
    goal: { kind: 'build', building: 'solarField' },
    hint: L(
      'Ohne Energie läuft nichts. Wählt unten ein Gebäude und tippt auf einen freien Platz.',
      'Nothing works without energy. Pick a building below and tap a free spot.',
    ),
    reward: { regolith: 100 },
  },
  {
    goal: { kind: 'build', building: 'pinkPump' },
    hint: L(
      'Holt pinke Flüssigkeit aus dem Boden. Baut es auf eine pinke Quelle.',
      'Gets pink liquid out of the ground. Build it on a pink spring.',
    ),
    reward: { regolith: 100 },
  },
  {
    goal: { kind: 'build', building: 'greenhouse' },
    hint: L('Hier wächst Nahrung für eure Bewohner.', 'Food for your residents grows here.'),
    reward: { food: 60 },
  },
  {
    goal: { kind: 'build', building: 'waterOxygenPlant' },
    hint: L(
      'Macht aus pinker Flüssigkeit Wasser und Sauerstoff zum Atmen.',
      'Turns pink liquid into water and oxygen to breathe.',
    ),
    reward: { water: 50, oxygen: 50 },
  },
  {
    goal: { kind: 'build', building: 'habitatDome' },
    hint: L(
      'Mehr Wohnplätze = mehr Bewohner. Und mehr Bewohner = mehr Arbeiter.',
      'More homes = more residents. And more residents = more workers.',
    ),
    reward: { regolith: 150 },
  },
  {
    goal: { kind: 'people', count: 12 },
    hint: L(
      'Neue Bewohner kommen bei guter Laune und freien Wohnplätzen. Tippt oben auf die Laune.',
      'New residents come when the mood is good and homes are free. Tap the mood at the top.',
    ),
    reward: { regolith: 200 },
  },
  {
    goal: { kind: 'build', building: 'huntingLodge' },
    hint: L(
      'Jäger schützen die Basis vor Spinnen und bringen Spinnen-Eier als Nahrung.',
      'Hunters protect the base from spiders and bring spider eggs as food.',
    ),
    reward: { food: 80 },
  },
  {
    goal: { kind: 'build', building: 'lab' },
    hint: L('Hier erforscht ihr neue Technik.', 'Here you research new technology.'),
    reward: { regolith: 150 },
  },
  {
    goal: { kind: 'research' },
    hint: L(
      'Tippt auf euer Gebäude „{b:lab}“ und startet eine Forschung.',
      'Tap your building “{b:lab}” and start a research.',
    ),
    reward: { crystals: 2 },
  },
  {
    goal: { kind: 'quiz' },
    hint: L(
      'Tippt oben rechts auf das Gehirn und beantwortet eine Frage richtig.',
      'Tap the brain at the top right and answer a question correctly.',
    ),
    reward: { crystals: 1 },
  },
  {
    goal: { kind: 'build', building: 'barracks' },
    hint: L(
      'Der Feind wird kommen. Baut Soldaten und verteidigt eure Kolonie!',
      'The enemy will come. Train soldiers and defend your colony!',
    ),
    reward: { regolith: 250 },
  },
];

/** The story at the start of a new game. */
export const STORY: Record<Faction, { title: Loc; lines: readonly Loc[] }> = {
  human: {
    title: L('Bruchlandung', 'Crash Landing'),
    lines: [
      L(
        'Euer Raumschiff ist auf einem fremden Planeten abgestürzt. Acht Menschen haben überlebt.',
        'Your spaceship has crashed on a strange planet. Eight people survived.',
      ),
      L(
        'Hier gibt es keine Luft zum Atmen. Ihr lebt in Glaskuppeln und braucht Sauerstoff, Wasser und Nahrung.',
        'There is no air to breathe here. You live in glass domes and need oxygen, water and food.',
      ),
      L(
        'Draußen krabbeln Spinnen mit sechs Augen. Und auf einem anderen Planeten wohnen Aliens. Sie wollen die gleichen Rohstoffe.',
        'Outside, spiders with six eyes crawl around. And aliens live on another planet. They want the same resources.',
      ),
      L('Baut eure Kolonie auf und überlebt!', 'Build your colony and survive!'),
    ],
  },
  alien: {
    title: L('Das Erwachen', 'The Awakening'),
    lines: [
      L(
        'Euer Brutkern ist nach langem Schlaf erwacht. Acht Wesen eures Volkes sind bei ihm.',
        'Your Brood Core has awoken after a long sleep. Eight creatures of your people are with it.',
      ),
      L(
        'Auf diesem Planeten gibt es keine Luft. Eure lebenden Kuppeln geben Schutz, aber ihr braucht Sauerstoff, Wasser und Nahrung.',
        'There is no air on this planet. Your living domes give shelter, but you need oxygen, water and food.',
      ),
      L(
        'Draußen krabbeln Spinnen mit sechs Augen. Und auf einem anderen Planeten sind Menschen gelandet. Sie wollen die gleichen Rohstoffe.',
        'Outside, spiders with six eyes crawl around. And humans have landed on another planet. They want the same resources.',
      ),
      L('Lasst eure Kolonie wachsen und überlebt!', 'Let your colony grow and survive!'),
    ],
  },
};
