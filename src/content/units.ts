import type { ResearchId } from './research';
import type { ResourceAmounts } from './resources';
import { AIR_SPACE_UNITS, type AirSpaceId } from './units-air-space';

export type UnitId =
  'drone' | 'hunter' | 'infantry' | 'tank' | 'miningShip' | 'transport' | 'spider' | AirSpaceId;

/** Which things a weapon can hit: on the ground, in the air, or both. */
export type Hits = 'ground' | 'air' | 'all';

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
  /** Takes this much less damage per hit. */
  armor: number;
  /** Damage factor against buildings (tanks are good at it). */
  vsBuildings?: number;
  /** Goes for buildings first (bombers). */
  prefersBuildings?: boolean;
  cost: ResourceAmounts;
  trainSeconds: number;
  /** Uses housing space (and space in a transport ship). */
  housing: number;
  /** Space ships: how much housing fits inside. */
  carries?: number;
  /** Flies high: only weapons that hit the air can hit it (fighters, flak). */
  air?: boolean;
  /** What its weapon can hit (default: ground). */
  hits?: Hits;
  /** War ship: lives in orbit, fights other ships. */
  space?: boolean;
  /** Needs this research before it can be trained. */
  requires?: ResearchId;
  /** Fuel: gas per minute while it flies or fights. */
  gasPerMinute?: number;
  /** Damage of one shot from orbit at a building (needs the Orbitallaser research). */
  orbitStrike?: number;
}

const NO_WEAPON = { damage: 0, range: 0, cooldownMs: 0 } as const;

export const UNITS: Record<UnitId, UnitDef> = {
  drone: {
    id: 'drone',
    name: 'Bau-Drohne',
    hp: 40,
    speed: 4,
    flying: true,
    ...NO_WEAPON,
    armor: 0,
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
    armor: 0,
    cost: { regolith: 50, food: 20, oxygen: 10 },
    trainSeconds: 20,
    housing: 1,
  },
  infantry: {
    id: 'infantry',
    name: 'Raumsoldat',
    hp: 110,
    speed: 2.3,
    flying: false,
    damage: 11,
    range: 5,
    cooldownMs: 1000,
    armor: 1,
    cost: { regolith: 70, food: 25, oxygen: 10 },
    trainSeconds: 25,
    housing: 1,
  },
  tank: {
    id: 'tank',
    name: 'Laser-Panzer',
    hp: 450,
    speed: 1.8,
    flying: false,
    damage: 40,
    range: 6.5,
    cooldownMs: 2200,
    armor: 4,
    vsBuildings: 1.5,
    cost: { regolith: 180, metal: 40, diamonds: 6 },
    trainSeconds: 60,
    housing: 3,
  },
  miningShip: {
    id: 'miningShip',
    name: 'Mining-Schiff',
    hp: 150,
    speed: 1,
    flying: true,
    ...NO_WEAPON,
    armor: 2,
    cost: { regolith: 200, diamonds: 10, water: 20 },
    trainSeconds: 60,
    housing: 0,
  },
  transport: {
    id: 'transport',
    name: 'Transportschiff',
    hp: 400,
    speed: 1,
    flying: true,
    ...NO_WEAPON,
    armor: 4,
    cost: { regolith: 300, diamonds: 15, water: 30 },
    trainSeconds: 60,
    housing: 0,
    carries: 10,
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
    armor: 0,
    cost: {},
    trainSeconds: 0,
    housing: 0,
  },
  ...AIR_SPACE_UNITS,
};

/** Food the hunter's owner gets for a defeated spider or a collected egg. */
export const SPIDER_FOOD = 40;
export const EGG_FOOD = 15;
