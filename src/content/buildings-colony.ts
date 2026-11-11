import type { BuildingDef } from './buildings';

/** M5: buildings that keep the people well and happy. */
export const COLONY_BUILDINGS: readonly BuildingDef[] = [
  {
    id: 'medbay',
    name: 'Krankenstation',
    category: 'housing',
    size: 2,
    tier: 2,
    description: 'Ärzte und Roboter machen kranke Bewohner wieder gesund.',
    levels: [
      { cost: { regolith: 180, water: 20 }, hp: 350, energy: -4, heals: 1 },
      { cost: { regolith: 450, water: 50 }, hp: 450, energy: -5, heals: 2 },
      { cost: { regolith: 1000, water: 90, diamonds: 15 }, hp: 550, energy: -6, heals: 3.5 },
    ],
  },
  {
    id: 'park',
    name: 'Park-Kuppel',
    category: 'housing',
    size: 3,
    tier: 2,
    description: 'Bäume, Wege und ein kleiner See unter Glas. Macht die Bewohner froh.',
    levels: [
      { cost: { regolith: 220, water: 40 }, hp: 350, energy: -3, mood: 6 },
      { cost: { regolith: 550, water: 80 }, hp: 450, energy: -4, mood: 10 },
      { cost: { regolith: 1200, water: 150, diamonds: 20 }, hp: 550, energy: -5, mood: 14 },
    ],
  },
];
