import type { ResourceAmounts } from './resources';

export type ResearchId =
  | 'betterSolar'
  | 'hydroponics'
  | 'diamondDrilling'
  | 'spaceflight'
  | 'efficientMining'
  | 'cargoBays'
  | 'lasers'
  | 'armor'
  | 'shields'
  | 'strongLasers'
  | 'radar'
  | 'flak'
  | 'aviation'
  | 'warships'
  | 'orbitalLaser';

export interface ResearchDef {
  id: ResearchId;
  name: string;
  description: string;
  cost: ResourceAmounts;
  /** Time stage (see time-curve). */
  stage: number;
  /** Needs this lab level. */
  labLevel: number;
  requires?: ResearchId;
}

export const RESEARCH_LIST: readonly ResearchDef[] = [
  {
    id: 'betterSolar',
    name: 'Bessere Solarzellen',
    description: '+25 % Energie aus Solarfeldern.',
    cost: { regolith: 150 },
    stage: 1,
    labLevel: 1,
  },
  {
    id: 'hydroponics',
    name: 'Hydrokultur',
    description: '+30 % Nahrung aus Gewächshäusern.',
    cost: { regolith: 200, water: 60 },
    stage: 2,
    labLevel: 1,
  },
  {
    id: 'diamondDrilling',
    name: 'Diamanten-Bohren',
    description: 'Schaltet den Diamanten-Bohrer frei.',
    cost: { regolith: 300, oxygen: 30 },
    stage: 2,
    labLevel: 1,
  },
  {
    id: 'spaceflight',
    name: 'Raumfahrt',
    description: 'Schaltet den Raumhafen und Mining-Schiffe frei.',
    cost: { regolith: 600, diamonds: 25, water: 60 },
    stage: 3,
    labLevel: 2,
    requires: 'diamondDrilling',
  },
  {
    id: 'efficientMining',
    name: 'Effizienter Abbau',
    description: '+25 % Regolith aus Baggern.',
    cost: { regolith: 400, diamonds: 10 },
    stage: 3,
    labLevel: 2,
  },
  {
    id: 'cargoBays',
    name: 'Große Laderäume',
    description: 'Mining-Schiffe tragen 50 % mehr.',
    cost: { regolith: 900, diamonds: 40, metal: 80 },
    stage: 4,
    labLevel: 2,
    requires: 'spaceflight',
  },
  {
    id: 'lasers',
    name: 'Lasertechnik',
    description: 'Schaltet Geschütztürme und die Fahrzeugfabrik frei.',
    cost: { regolith: 250, diamonds: 5 },
    stage: 2,
    labLevel: 1,
  },
  {
    id: 'armor',
    name: 'Panzerung',
    description: 'Alle eure Einheiten bekommen +2 Rüstung.',
    cost: { regolith: 500, diamonds: 20 },
    stage: 3,
    labLevel: 2,
    requires: 'lasers',
  },
  {
    id: 'shields',
    name: 'Schildtechnik',
    description: 'Schaltet Schildreaktor und Kraftfeld-Wand frei.',
    cost: { regolith: 700, diamonds: 35, water: 60 },
    stage: 3,
    labLevel: 2,
    requires: 'lasers',
  },
  {
    id: 'strongLasers',
    name: 'Starke Laser',
    description: '+25 % Schaden für Einheiten und Türme.',
    cost: { regolith: 1200, diamonds: 60, metal: 60 },
    stage: 4,
    labLevel: 3,
    requires: 'lasers',
  },
  {
    id: 'radar',
    name: 'Fernradar',
    description: 'Zeigt die Gebäude des Feindes. Ihr könnt auf seinen Planeten zoomen.',
    cost: { regolith: 1000, diamonds: 50, metal: 60 },
    stage: 4,
    labLevel: 3,
    requires: 'spaceflight',
  },
  {
    id: 'flak',
    name: 'Flugabwehr',
    description: 'Schaltet Flak-Turm und Flak-Panzer frei. Sie schießen Flugzeuge ab.',
    cost: { regolith: 500, diamonds: 20 },
    stage: 3,
    labLevel: 2,
    requires: 'lasers',
  },
  {
    id: 'aviation',
    name: 'Luftfahrt',
    description: 'Schaltet das Flugfeld frei: Jagdflugzeuge und Bomber. Flugzeuge tanken Gas.',
    cost: { regolith: 900, diamonds: 40, gas: 40 },
    stage: 3,
    labLevel: 2,
    requires: 'spaceflight',
  },
  {
    id: 'warships',
    name: 'Kampfschiffe',
    description: 'Der Raumhafen baut Raumjäger und Kreuzer. Dazu: die Orbitalkanone.',
    cost: { regolith: 1500, diamonds: 70, metal: 150, gas: 60 },
    stage: 4,
    labLevel: 3,
    requires: 'aviation',
  },
  {
    id: 'orbitalLaser',
    name: 'Orbitallaser',
    description: 'Kreuzer beschießen feindliche Gebäude aus dem Orbit. Schilde fangen das ab.',
    cost: { regolith: 2500, diamonds: 120, metal: 300, gas: 100 },
    stage: 4,
    labLevel: 3,
    requires: 'warships',
  },
];

export const RESEARCH: Record<ResearchId, ResearchDef> = Object.fromEntries(
  RESEARCH_LIST.map((r) => [r.id, r]),
) as Record<ResearchId, ResearchDef>;
