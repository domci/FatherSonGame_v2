import type { ResourceAmounts } from './resources';
import { L } from './text';
import type { Loc } from './text';

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
  name: Loc;
  description: Loc;
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
    name: L('Bessere Solarzellen', 'Better Solar Cells'),
    description: L('+25 % Energie aus Solarfeldern.', '+25 % energy from solar fields.'),
    cost: { regolith: 150 },
    stage: 1,
    labLevel: 1,
  },
  {
    id: 'hydroponics',
    name: L('Hydrokultur', 'Hydroponics'),
    description: L('+30 % Nahrung aus Gewächshäusern.', '+30 % food from greenhouses.'),
    cost: { regolith: 200, water: 60 },
    stage: 2,
    labLevel: 1,
  },
  {
    id: 'diamondDrilling',
    name: L('Diamanten-Bohren', 'Diamond Drilling'),
    description: L('Schaltet den Diamanten-Bohrer frei.', 'Unlocks the diamond drill.'),
    cost: { regolith: 300, oxygen: 30 },
    stage: 2,
    labLevel: 1,
  },
  {
    id: 'spaceflight',
    name: L('Raumfahrt', 'Spaceflight'),
    description: L(
      'Schaltet den Raumhafen und Mining-Schiffe frei.',
      'Unlocks the spaceport and mining ships.',
    ),
    cost: { regolith: 600, diamonds: 25, water: 60 },
    stage: 3,
    labLevel: 2,
    requires: 'diamondDrilling',
  },
  {
    id: 'efficientMining',
    name: L('Effizienter Abbau', 'Efficient Mining'),
    description: L('+25 % Regolith aus Baggern.', '+25 % regolith from excavators.'),
    cost: { regolith: 400, diamonds: 10 },
    stage: 3,
    labLevel: 2,
  },
  {
    id: 'cargoBays',
    name: L('Große Laderäume', 'Big Cargo Bays'),
    description: L('Mining-Schiffe tragen 50 % mehr.', 'Mining ships carry 50 % more.'),
    cost: { regolith: 900, diamonds: 40, metal: 80 },
    stage: 4,
    labLevel: 2,
    requires: 'spaceflight',
  },
  {
    id: 'lasers',
    name: L('Lasertechnik', 'Laser Technology'),
    description: L(
      'Schaltet Geschütztürme und die Fahrzeugfabrik frei.',
      'Unlocks gun turrets and the vehicle factory.',
    ),
    cost: { regolith: 250, diamonds: 5 },
    stage: 2,
    labLevel: 1,
  },
  {
    id: 'armor',
    name: L('Panzerung', 'Armor'),
    description: L('Alle eure Einheiten bekommen +2 Rüstung.', 'All your units get +2 armor.'),
    cost: { regolith: 500, diamonds: 20 },
    stage: 3,
    labLevel: 2,
    requires: 'lasers',
  },
  {
    id: 'shields',
    name: L('Schildtechnik', 'Shield Technology'),
    description: L(
      'Schaltet Schildreaktor und Kraftfeld-Wand frei.',
      'Unlocks the shield reactor and force field wall.',
    ),
    cost: { regolith: 700, diamonds: 35, water: 60 },
    stage: 3,
    labLevel: 2,
    requires: 'lasers',
  },
  {
    id: 'strongLasers',
    name: L('Starke Laser', 'Strong Lasers'),
    description: L('+25 % Schaden für Einheiten und Türme.', '+25 % damage for units and turrets.'),
    cost: { regolith: 1200, diamonds: 60, metal: 60 },
    stage: 4,
    labLevel: 3,
    requires: 'lasers',
  },
  {
    id: 'radar',
    name: L('Fernradar', 'Long-Range Radar'),
    description: L(
      'Zeigt die Gebäude der anderen Völker. Ihr könnt auf ihre Heimatplaneten zoomen.',
      'Shows the buildings of the other peoples. You can zoom onto their home planets.',
    ),
    cost: { regolith: 1000, diamonds: 50, metal: 60 },
    stage: 4,
    labLevel: 3,
    requires: 'spaceflight',
  },
  {
    id: 'flak',
    name: L('Flugabwehr', 'Anti-Air'),
    description: L(
      'Schaltet Flak-Turm und Flak-Panzer frei. Sie schießen Flugzeuge ab.',
      'Unlocks the flak tower and flak tank. They shoot down aircraft.',
    ),
    cost: { regolith: 500, diamonds: 20 },
    stage: 3,
    labLevel: 2,
    requires: 'lasers',
  },
  {
    id: 'aviation',
    name: L('Luftfahrt', 'Aviation'),
    description: L(
      'Schaltet das Flugfeld frei: Jagdflugzeuge und Bomber. Flugzeuge tanken Gas.',
      'Unlocks the airfield: fighter jets and bombers. Aircraft refuel with gas.',
    ),
    cost: { regolith: 900, diamonds: 40, gas: 40 },
    stage: 3,
    labLevel: 2,
    requires: 'spaceflight',
  },
  {
    id: 'warships',
    name: L('Kampfschiffe', 'Warships'),
    description: L(
      'Der Raumhafen baut Raumjäger und Kreuzer. Dazu: die Orbitalkanone.',
      'The spaceport builds space fighters and cruisers. Plus: the orbital cannon.',
    ),
    cost: { regolith: 1500, diamonds: 70, metal: 150, gas: 60 },
    stage: 4,
    labLevel: 3,
    requires: 'aviation',
  },
  {
    id: 'orbitalLaser',
    name: L('Orbitallaser', 'Orbital Laser'),
    description: L(
      'Kreuzer beschießen feindliche Gebäude aus dem Orbit. Schilde fangen das ab.',
      'Cruisers fire at enemy buildings from orbit. Shields stop it.',
    ),
    cost: { regolith: 2500, diamonds: 120, metal: 300, gas: 100 },
    stage: 4,
    labLevel: 3,
    requires: 'warships',
  },
];

export const RESEARCH: Record<ResearchId, ResearchDef> = Object.fromEntries(
  RESEARCH_LIST.map((r) => [r.id, r]),
) as Record<ResearchId, ResearchDef>;
