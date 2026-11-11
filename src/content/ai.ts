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
  { research: 'flak' },
  { build: 'flakTower', count: 2 },
  { upgrade: 'turret', level: 2 },
  { upgrade: 'barracks', level: 2 },
  { train: 'transport', count: 3 },
  { train: 'miningShip', count: 3 },
  { research: 'aviation' },
  { build: 'airfield', count: 1 },
  { research: 'warships' },
  { build: 'flakTower', count: 4 },
  { build: 'orbitalCannon', count: 1 },
  { research: 'orbitalLaser' },
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
  /**
   * Keeps the computer at a similar level: its progress (building levels + research)
   * may be at most `lead` × the player's progress + `leadBonus`.
   */
  lead: number;
  leadBonus: number;
  /** Home army strength at most this share of the player's whole military. */
  armyShare: number;
  /** An attack wave is at most this share of what defends the player's home. */
  waveShare: number;
  /** No attacks before the player has this much progress. */
  minPlayerProgress: number;
}

const MIN = 60_000;

export const AI_TUNING: Record<Difficulty, AiTuning> = {
  easy: {
    firstAttackMs: 120 * MIN,
    attackEveryMs: 45 * MIN,
    firstWave: 3,
    waveGrowth: 1,
    defenders: 2,
    lead: 0.7,
    leadBonus: 2,
    armyShare: 0.5,
    waveShare: 0.5,
    minPlayerProgress: 30,
  },
  normal: {
    firstAttackMs: 75 * MIN,
    attackEveryMs: 30 * MIN,
    firstWave: 4,
    waveGrowth: 1,
    defenders: 3,
    lead: 0.85,
    leadBonus: 3,
    armyShare: 0.7,
    waveShare: 0.6,
    minPlayerProgress: 22,
  },
  hard: {
    firstAttackMs: 45 * MIN,
    attackEveryMs: 20 * MIN,
    firstWave: 6,
    waveGrowth: 2,
    defenders: 4,
    lead: 1.1,
    leadBonus: 5,
    armyShare: 1.1,
    waveShare: 1.1,
    minPlayerProgress: 15,
  },
};

export const DIFFICULTY_NAMES: Record<Difficulty, string> = {
  easy: 'Leicht',
  normal: 'Mittel',
  hard: 'Schwer',
};

/** One line per level for the new game dialog. */
export const DIFFICULTY_HELP: Record<Difficulty, string> = {
  easy: 'Der Gegner bleibt hinter euch zurück und greift erst spät und schwach an.',
  normal: 'Der Gegner wächst etwas langsamer als ihr. Angriffe erst, wenn ihr bereit seid.',
  hard: 'Der Gegner hält mit euch mit und greift früher an.',
};
