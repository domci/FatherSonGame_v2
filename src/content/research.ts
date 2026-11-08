import type { ResourceAmounts } from './resources';

export type ResearchId =
  | 'betterSolar'
  | 'hydroponics'
  | 'diamondDrilling'
  | 'spaceflight'
  | 'efficientMining'
  | 'cargoBays';

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
];

export const RESEARCH: Record<ResearchId, ResearchDef> = Object.fromEntries(
  RESEARCH_LIST.map((r) => [r.id, r]),
) as Record<ResearchId, ResearchDef>;
