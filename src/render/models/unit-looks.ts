import type { Faction } from '../../content/factions';
import type { UnitId } from '../../content/units';
import type { ClipNames } from './animator';
import type { KitName } from './kit';
import type { MaterialName } from './parts';

export interface UnitLook {
  kit: KitName;
  /** Height in tiles (before UNIT_SCALE). */
  height: number;
  /** Longest side on the ground in tiles (before UNIT_SCALE). Flat craft use it instead of height. */
  length?: number;
  /** Paint the model by its material names. */
  mats?: Partial<Record<string, MaterialName>>;
  anims?: ClipNames;
  /** Kenney ship painted in alien colors. */
  alienPaint?: boolean;
}

type Looks = Partial<Record<UnitId, UnitLook>>;

const HUMAN: Looks = {
  drone: { kit: 'h_drone', height: 0.55 },
  hunter: { kit: 'h_hunter', height: 0.75 },
  infantry: { kit: 'h_infantry', height: 0.82 },
  tank: { kit: 'h_tank', height: 0.62 },
  miningShip: { kit: 'h_miner', height: 0.5 },
  transport: { kit: 'h_transport', height: 0.6 },
  flakTank: { kit: 'h_flak', height: 0.8 },
  fighter: { kit: 'h_fighter', height: 0.3, length: 0.6 },
  bomber: { kit: 'h_bomber', height: 0.42, length: 0.75 },
  spaceFighter: { kit: 'h_space_fighter', height: 0.35, length: 0.7 },
  cruiser: { kit: 'h_cruiser', height: 0.6, length: 1.3 },
};

const ALIEN: Looks = {
  drone: { kit: 'a_drone', height: 0.6 },
  hunter: { kit: 'a_hunter', height: 0.55 },
  infantry: { kit: 'a_infantry', height: 0.85 },
  tank: { kit: 'a_tank', height: 0.6 },
  miningShip: { kit: 'a_miner', height: 0.45 },
  flakTank: { kit: 'a_flak', height: 0.8 },
  fighter: { kit: 'a_fighter', height: 0.45 },
  bomber: { kit: 'a_bomber', height: 0.6 },
  spaceFighter: { kit: 'a_space_fighter', height: 0.35, length: 0.7 },
};

export const UNIT_LOOKS: Record<Faction, Looks> = { human: HUMAN, alien: ALIEN };
