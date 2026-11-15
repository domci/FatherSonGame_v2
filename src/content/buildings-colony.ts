import type { BuildingDef } from './buildings';
import { L } from './text';

/** Food (greenhouse) and M5 buildings that keep the people well and happy. */
export const COLONY_BUILDINGS: readonly BuildingDef[] = [
  {
    id: 'greenhouse',
    name: L('Gewächshaus', 'Greenhouse'),
    category: 'food',
    size: 3,
    tier: 1,
    description: L(
      'Pflanzen unter Glas. Braucht Wasser, macht Nahrung.',
      'Plants under glass. Needs water, makes food.',
    ),
    levels: [
      {
        cost: { regolith: 100, water: 20 },
        hp: 300,
        energy: -4,
        consumes: { water: 4 },
        produces: { food: 16 },
      },
      {
        cost: { regolith: 260, water: 40 },
        hp: 400,
        energy: -5,
        consumes: { water: 6 },
        produces: { food: 28 },
      },
      {
        cost: { regolith: 600, water: 80, diamonds: 10 },
        hp: 500,
        energy: -6,
        consumes: { water: 8 },
        produces: { food: 45 },
      },
    ],
  },
  {
    id: 'medbay',
    name: L('Krankenstation', 'Sick Bay'),
    category: 'housing',
    size: 2,
    tier: 2,
    description: L(
      'Ärzte und Roboter machen kranke Bewohner wieder gesund.',
      'Doctors and robots make sick residents healthy again.',
    ),
    levels: [
      { cost: { regolith: 180, water: 20 }, hp: 350, energy: -4, heals: 1 },
      { cost: { regolith: 450, water: 50 }, hp: 450, energy: -5, heals: 2 },
      { cost: { regolith: 1000, water: 90, diamonds: 15 }, hp: 550, energy: -6, heals: 3.5 },
    ],
  },
  {
    id: 'park',
    name: L('Park-Kuppel', 'Park Dome'),
    category: 'housing',
    size: 3,
    tier: 2,
    description: L(
      'Bäume, Wege und ein kleiner See unter Glas. Macht die Bewohner froh.',
      'Trees, paths and a small lake under glass. Makes the residents happy.',
    ),
    levels: [
      { cost: { regolith: 220, water: 40 }, hp: 350, energy: -3, mood: 6 },
      { cost: { regolith: 550, water: 80 }, hp: 450, energy: -4, mood: 10 },
      { cost: { regolith: 1200, water: 150, diamonds: 20 }, hp: 550, energy: -5, mood: 14 },
    ],
  },
];
