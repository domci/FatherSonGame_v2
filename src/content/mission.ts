import type { BuildingId } from './buildings';
import type { Faction } from './factions';
import type { ResourceAmounts } from './resources';

/** What a mission step wants. The UI writes the title from it (with the faction's names). */
export type MissionGoal =
  | { kind: 'build'; building: BuildingId }
  | { kind: 'people'; count: number }
  | { kind: 'research' }
  | { kind: 'quiz' };

export interface MissionStep {
  goal: MissionGoal;
  /** Why and how, in one or two short sentences. */
  hint: string;
  reward: ResourceAmounts;
}

export const MISSION_NAME = 'Überleben';

/** The first mission: from the crash to a small, safe colony. */
export const MISSION: readonly MissionStep[] = [
  {
    goal: { kind: 'build', building: 'solarField' },
    hint: 'Ohne Energie läuft nichts. Wählt unten ein Gebäude und tippt auf einen freien Platz.',
    reward: { regolith: 100 },
  },
  {
    goal: { kind: 'build', building: 'pinkPump' },
    hint: 'Die Pumpe holt pinke Flüssigkeit aus dem Boden. Sie muss auf eine pinke Quelle.',
    reward: { regolith: 100 },
  },
  {
    goal: { kind: 'build', building: 'greenhouse' },
    hint: 'Hier wächst Nahrung für eure Bewohner.',
    reward: { food: 60 },
  },
  {
    goal: { kind: 'build', building: 'waterOxygenPlant' },
    hint: 'Macht aus pinker Flüssigkeit Wasser und Sauerstoff zum Atmen.',
    reward: { water: 50, oxygen: 50 },
  },
  {
    goal: { kind: 'build', building: 'habitatDome' },
    hint: 'Mehr Wohnplätze = mehr Bewohner. Und mehr Bewohner = mehr Arbeiter.',
    reward: { regolith: 150 },
  },
  {
    goal: { kind: 'people', count: 12 },
    hint: 'Neue Bewohner kommen bei guter Laune und freien Wohnplätzen. Tippt oben auf die Laune.',
    reward: { regolith: 200 },
  },
  {
    goal: { kind: 'build', building: 'huntingLodge' },
    hint: 'Jäger schützen die Basis vor Spinnen und bringen Spinnen-Eier als Nahrung.',
    reward: { food: 80 },
  },
  {
    goal: { kind: 'build', building: 'lab' },
    hint: 'Im Labor erforscht ihr neue Technik.',
    reward: { regolith: 150 },
  },
  {
    goal: { kind: 'research' },
    hint: 'Wählt das Labor aus und startet eine Forschung.',
    reward: { crystals: 2 },
  },
  {
    goal: { kind: 'quiz' },
    hint: 'Tippt oben rechts auf das Gehirn und beantwortet eine Frage richtig.',
    reward: { crystals: 1 },
  },
  {
    goal: { kind: 'build', building: 'barracks' },
    hint: 'Der Feind wird kommen. Baut Soldaten und verteidigt eure Kolonie!',
    reward: { regolith: 250 },
  },
];

/** The story at the start of a new game. */
export const STORY: Record<Faction, { title: string; lines: readonly string[] }> = {
  human: {
    title: 'Bruchlandung',
    lines: [
      'Euer Raumschiff ist auf einem fremden Planeten abgestürzt. Acht Menschen haben überlebt.',
      'Hier gibt es keine Luft zum Atmen. Ihr lebt in Glaskuppeln und braucht Sauerstoff, Wasser und Nahrung.',
      'Draußen krabbeln Spinnen mit sechs Augen. Und auf einem anderen Planeten wohnen Aliens. Sie wollen die gleichen Rohstoffe.',
      'Baut eure Kolonie auf und überlebt!',
    ],
  },
  alien: {
    title: 'Das Erwachen',
    lines: [
      'Euer Brutkern ist nach langem Schlaf erwacht. Acht Wesen eures Volkes sind bei ihm.',
      'Auf diesem Planeten gibt es keine Luft. Eure lebenden Kuppeln geben Schutz, aber ihr braucht Sauerstoff, Wasser und Nahrung.',
      'Draußen krabbeln Spinnen mit sechs Augen. Und auf einem anderen Planeten sind Menschen gelandet. Sie wollen die gleichen Rohstoffe.',
      'Lasst eure Kolonie wachsen und überlebt!',
    ],
  },
};
