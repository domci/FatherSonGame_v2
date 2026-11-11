import type { BuildingDef } from './buildings';

/** Military, research and space buildings. */
export const ADVANCED_BUILDINGS: readonly BuildingDef[] = [
  {
    id: 'huntingLodge',
    name: 'Jagdstation',
    category: 'military',
    size: 2,
    tier: 2,
    description: 'Bildet Jäger aus. Jäger beschützen die Basis und jagen Spinnen.',
    trains: ['hunter'],
    levels: [
      { cost: { regolith: 150, food: 30 }, hp: 400, energy: -3 },
      { cost: { regolith: 350, food: 60 }, hp: 550, energy: -4 },
      { cost: { regolith: 800, diamonds: 20 }, hp: 700, energy: -5 },
    ],
  },
  {
    id: 'lab',
    name: 'Labor',
    category: 'research',
    size: 2,
    tier: 2,
    description: 'Hier wird geforscht. Forschung schaltet neue Technik frei.',
    levels: [
      { cost: { regolith: 200, water: 30 }, hp: 350, energy: -6 },
      { cost: { regolith: 500, diamonds: 20 }, hp: 450, energy: -8 },
      { cost: { regolith: 1200, diamonds: 60 }, hp: 550, energy: -10 },
    ],
  },
  {
    id: 'diamondDrill',
    name: 'Diamanten-Bohrer',
    category: 'mining',
    size: 2,
    tier: 2,
    needsDeposit: 'diamond',
    requires: 'diamondDrilling',
    description: 'Bohrt seltene Diamanten aus einem Vorkommen.',
    levels: [
      { cost: { regolith: 250 }, hp: 300, energy: -8, produces: { diamonds: 4 } },
      { cost: { regolith: 600, diamonds: 20 }, hp: 400, energy: -10, produces: { diamonds: 7 } },
      { cost: { regolith: 1400, diamonds: 60 }, hp: 500, energy: -12, produces: { diamonds: 11 } },
    ],
  },
  {
    id: 'spaceport',
    name: 'Raumhafen',
    category: 'space',
    size: 4,
    tier: 3,
    requires: 'spaceflight',
    description: 'Baut Mining-Schiffe, Transportschiffe und (mit Forschung) Kampfschiffe.',
    trains: ['miningShip', 'transport', 'spaceFighter', 'cruiser'],
    levels: [
      { cost: { regolith: 800, diamonds: 30, water: 50 }, hp: 900, energy: -12 },
      { cost: { regolith: 2000, diamonds: 80, metal: 200 }, hp: 1200, energy: -16 },
      { cost: { regolith: 5000, diamonds: 200, metal: 600 }, hp: 1500, energy: -20 },
    ],
  },
];
