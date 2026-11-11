import type { BuildingDef } from './buildings';

/** M4: air field, flak and the cannon that shoots into orbit. */
export const AIR_SPACE_BUILDINGS: readonly BuildingDef[] = [
  {
    id: 'airfield',
    name: 'Flugfeld',
    category: 'military',
    size: 4,
    tier: 3,
    requires: 'aviation',
    description: 'Baut Jagdflugzeuge und Bomber. Flugzeuge fliegen über Mauern und tanken Gas.',
    trains: ['fighter', 'bomber'],
    levels: [
      { cost: { regolith: 900, metal: 60, diamonds: 30 }, hp: 1200, energy: -10, armor: 3 },
      { cost: { regolith: 2000, metal: 150, diamonds: 70 }, hp: 1500, energy: -12, armor: 4 },
      { cost: { regolith: 4500, metal: 400, diamonds: 160 }, hp: 1800, energy: -14, armor: 5 },
    ],
  },
  {
    id: 'flakTower',
    name: 'Flak-Turm',
    category: 'defense',
    size: 2,
    tier: 3,
    requires: 'flak',
    description: 'Schießt Flugzeuge ab. Gegen Bodentruppen hilft er nicht.',
    levels: [
      {
        cost: { regolith: 300, diamonds: 12 },
        hp: 700,
        energy: -4,
        armor: 4,
        weapon: { damage: 26, range: 9, cooldownMs: 700, hits: 'air' },
      },
      {
        cost: { regolith: 700, diamonds: 30 },
        hp: 950,
        energy: -5,
        armor: 5,
        weapon: { damage: 38, range: 9.5, cooldownMs: 650, hits: 'air' },
      },
      {
        cost: { regolith: 1500, diamonds: 70, metal: 80 },
        hp: 1300,
        energy: -6,
        armor: 6,
        weapon: { damage: 52, range: 10, cooldownMs: 600, hits: 'air' },
      },
    ],
  },
  {
    id: 'orbitalCannon',
    name: 'Orbitalkanone',
    category: 'defense',
    size: 3,
    tier: 4,
    requires: 'warships',
    description: 'Schießt feindliche Kampfschiffe im Orbit über eurem Planeten ab.',
    levels: [
      {
        cost: { regolith: 1500, metal: 200, diamonds: 60 },
        hp: 1400,
        energy: -20,
        armor: 5,
        weapon: { damage: 80, range: 0, cooldownMs: 2500, hits: 'space' },
      },
      {
        cost: { regolith: 3200, metal: 450, diamonds: 130 },
        hp: 1800,
        energy: -24,
        armor: 6,
        weapon: { damage: 120, range: 0, cooldownMs: 2300, hits: 'space' },
      },
      {
        cost: { regolith: 7000, metal: 900, diamonds: 280 },
        hp: 2300,
        energy: -28,
        armor: 7,
        weapon: { damage: 170, range: 0, cooldownMs: 2100, hits: 'space' },
      },
    ],
  },
];
