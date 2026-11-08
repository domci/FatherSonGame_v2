import type { ResourceAmounts } from './resources';

export type UnitId = 'drone' | 'hunter' | 'miningShip' | 'spider';

export interface UnitDef {
  id: UnitId;
  name: string;
  hp: number;
  /** Tiles per second (surface) or AU per minute (ships). */
  speed: number;
  flying: boolean;
  damage: number;
  /** Attack range in tiles. */
  range: number;
  cooldownMs: number;
  cost: ResourceAmounts;
  trainSeconds: number;
  /** Uses housing space. */
  housing: number;
}

export const UNITS: Record<UnitId, UnitDef> = {
  drone: {
    id: 'drone',
    name: 'Bau-Drohne',
    hp: 40,
    speed: 4,
    flying: true,
    damage: 0,
    range: 0,
    cooldownMs: 0,
    cost: { regolith: 60, oxygen: 5 },
    trainSeconds: 15,
    housing: 1,
  },
  hunter: {
    id: 'hunter',
    name: 'Jäger',
    hp: 90,
    speed: 2.5,
    flying: false,
    damage: 12,
    range: 4,
    cooldownMs: 900,
    cost: { regolith: 50, food: 20, oxygen: 10 },
    trainSeconds: 20,
    housing: 1,
  },
  miningShip: {
    id: 'miningShip',
    name: 'Mining-Schiff',
    hp: 150,
    speed: 1,
    flying: true,
    damage: 0,
    range: 0,
    cooldownMs: 0,
    cost: { regolith: 200, diamonds: 10, water: 20 },
    trainSeconds: 60,
    housing: 0,
  },
  spider: {
    id: 'spider',
    name: 'Spinnenwesen',
    hp: 60,
    speed: 2,
    flying: false,
    damage: 6,
    range: 1.2,
    cooldownMs: 1200,
    cost: {},
    trainSeconds: 0,
    housing: 0,
  },
};

/** Food the hunter's owner gets for a defeated spider or a collected egg. */
export const SPIDER_FOOD = 40;
export const EGG_FOOD = 15;
