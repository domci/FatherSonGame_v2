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
  drone: { kit: 'robot_flyer', height: 0.55 },
  hunter: { kit: 'robot_gunner', height: 0.75 },
  infantry: {
    kit: 'astronaut',
    height: 0.82,
    anims: { idle: 'Idle_Gun', move: 'Run_Gun', attack: 'Idle_Gun' },
  },
  tank: {
    kit: 'tank',
    height: 0.62,
    mats: {
      Main: 'white',
      Main_Light: 'white',
      Main_Dark: 'steel',
      Main_Details: 'orange',
      Wheels: 'dark',
    },
    anims: { move: 'Tank_Forward' },
  },
  miningShip: { kit: 'craft_miner', height: 0.5 },
  transport: { kit: 'cargo_ship', height: 0.7 },
  flakTank: {
    kit: 'mech',
    height: 0.8,
    mats: { Atlas: 'white' },
    anims: { attack: 'Shoot_Small' },
  },
  fighter: { kit: 'craft_speederD', height: 0.3, length: 0.6 },
  bomber: { kit: 'craft_speederB', height: 0.42, length: 0.7, mats: { metal: 'steel' } },
  spaceFighter: { kit: 'craft_speederA', height: 0.35, length: 0.7 },
  cruiser: { kit: 'craft_cargoB', height: 0.6, length: 1.3 },
};

const ALIEN: Looks = {
  drone: {
    kit: 'jelly_flyer',
    height: 0.6,
    mats: { Glub_Main: 'skinChitin', Wings: 'glowCyan' },
    anims: { idle: 'Flying_Idle', move: 'Fast_Flying', attack: 'Punch' },
  },
  hunter: {
    kit: 'armored_bee',
    height: 0.55,
    mats: {
      Armabee_Main: 'skinChitin',
      Armabee_Secondary: 'skinFlesh',
      Wings: 'membrane',
      Eye_White: 'glowGreen',
    },
    anims: { idle: 'Flying_Idle', move: 'Fast_Flying', attack: 'Headbutt' },
  },
  infantry: {
    kit: 'alien_big',
    height: 0.85,
    mats: {
      Alien_Main: 'skinChitin',
      Alien_Secondary: 'skinFlesh',
      Eye_White: 'glowGreen',
      Tongue: 'glowViolet',
    },
    anims: { idle: 'Idle', move: 'Run', attack: 'Weapon' },
  },
  tank: {
    kit: 'crab',
    height: 0.6,
    mats: { Main: 'skinChitin', Main_Dark: 'skinFlesh', White: 'glowGreen' },
    anims: { idle: 'Idle', move: 'Walk', attack: 'Bite_InPlace' },
  },
  miningShip: { kit: 'speeder_c', height: 0.4, alienPaint: true },
  flakTank: {
    kit: 'mech_heavy',
    height: 0.8,
    mats: { Atlas: 'skinChitin' },
    anims: { attack: 'Shoot_Big' },
  },
  fighter: {
    kit: 'bat',
    height: 0.45,
    mats: { Main: 'skinChitin', Belly: 'skinFlesh', Eyes: 'glowGreen', Nose: 'glowViolet' },
    anims: { idle: 'Bat_Flying', move: 'Bat_Flying', attack: 'Bat_Attack' },
  },
  bomber: {
    kit: 'wyvern',
    height: 0.6,
    mats: { Main: 'skinChitin', Belly: 'skinFlesh', Eyes: 'glowGreen', Claws: 'bone' },
    anims: { idle: 'Dragon_Flying', move: 'Dragon_Flying', attack: 'Dragon_Attack' },
  },
  spaceFighter: { kit: 'craft_speederD', height: 0.35, length: 0.7, alienPaint: true },
};

export const UNIT_LOOKS: Record<Faction, Looks> = { human: HUMAN, alien: ALIEN };
