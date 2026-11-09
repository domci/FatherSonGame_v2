import type { BuildingId } from './buildings';
import type { ResearchId } from './research';
import type { UnitId } from './units';

/** One step of the computer player's plan. Counts are totals, not "build n more". */
export type AiStep =
  | { build: BuildingId; count: number }
  | { research: ResearchId }
  | { train: UnitId; count: number }
  | { upgrade: BuildingId; level: number };

/** The computer player works through this list from the top. */
export const AI_PLAN: readonly AiStep[] = [
  { train: 'drone', count: 3 },
  { build: 'solarField', count: 1 },
  { build: 'regolithExcavator', count: 2 },
  { build: 'solarField', count: 2 },
  { build: 'pinkPump', count: 1 },
  { build: 'waterOxygenPlant', count: 1 },
  { build: 'greenhouse', count: 1 },
  { build: 'regolithExcavator', count: 3 },
  { build: 'lab', count: 1 },
  { research: 'lasers' },
  { build: 'barracks', count: 1 },
  { train: 'infantry', count: 3 },
  { train: 'drone', count: 4 },
  { build: 'pinkPump', count: 2 },
  { research: 'diamondDrilling' },
  { build: 'diamondDrill', count: 1 },
  { build: 'turret', count: 2 },
  { build: 'storage', count: 1 },
  { research: 'betterSolar' },
  { upgrade: 'lab', level: 2 },
  { research: 'spaceflight' },
  { build: 'spaceport', count: 1 },
  { train: 'miningShip', count: 2 },
  { train: 'transport', count: 1 },
  { build: 'vehicleFactory', count: 1 },
  { build: 'greenhouse', count: 2 },
  { research: 'armor' },
  { build: 'turret', count: 4 },
  { train: 'transport', count: 2 },
  { upgrade: 'regolithExcavator', level: 2 },
  { research: 'shields' },
  { build: 'shieldReactor', count: 1 },
  { upgrade: 'solarField', level: 2 },
  { upgrade: 'lab', level: 3 },
  { research: 'strongLasers' },
  { upgrade: 'turret', level: 2 },
  { upgrade: 'barracks', level: 2 },
  { train: 'transport', count: 3 },
  { build: 'turret', count: 6 },
  { build: 'solarField', count: 4 },
  { upgrade: 'habitatDome', level: 2 },
  { upgrade: 'regolithExcavator', level: 3 },
  { upgrade: 'solarField', level: 3 },
  { upgrade: 'vehicleFactory', level: 2 },
  { upgrade: 'turret', level: 3 },
  { upgrade: 'shieldReactor', level: 2 },
  { upgrade: 'commandDome', level: 2 },
];

export type Difficulty = 'easy' | 'normal' | 'hard';

export interface AiTuning {
  /** Earliest first attack (game time since start, ms). */
  firstAttackMs: number;
  /** Time between attacks (ms). */
  attackEveryMs: number;
  /** Housing of the first attack wave; grows by `waveGrowth` each time. */
  firstWave: number;
  waveGrowth: number;
  /** Units that always stay home. */
  defenders: number;
}

const MIN = 60_000;

export const AI_TUNING: Record<Difficulty, AiTuning> = {
  easy: {
    firstAttackMs: 75 * MIN,
    attackEveryMs: 35 * MIN,
    firstWave: 4,
    waveGrowth: 1,
    defenders: 3,
  },
  normal: {
    firstAttackMs: 50 * MIN,
    attackEveryMs: 25 * MIN,
    firstWave: 6,
    waveGrowth: 2,
    defenders: 4,
  },
  hard: {
    firstAttackMs: 35 * MIN,
    attackEveryMs: 18 * MIN,
    firstWave: 8,
    waveGrowth: 2,
    defenders: 5,
  },
};

export const DIFFICULTY_NAMES: Record<Difficulty, string> = {
  easy: 'Leicht',
  normal: 'Normal',
  hard: 'Schwer',
};
