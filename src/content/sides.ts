import type { AiId, SideId } from '../sim/entity';
import type { Faction } from './factions';

/** At most this many computer sides in one game (M6). */
export const MAX_OPPONENTS = 3;

/** The human player's name in lists ("Ihr" = you, plural, like everywhere in the game). */
export const PLAYER_NAME = 'Ihr';

/** Names of computer sides, by people. Each computer side takes the next free one. */
export const SIDE_NAMES: Record<Faction, readonly string[]> = {
  human: ['Kolonie Nova', 'Station Orion', 'Basis Vega'],
  alien: ['Schwarm Xar', 'Brut der Zyl', 'Nest Krah'],
};

/** One color per side, for lists, labels and planet rings. */
export const SIDE_COLORS: Record<SideId, string> = {
  player: '#5fd0ff',
  ai: '#ff5d6c',
  ai2: '#ffa03a',
  ai3: '#c08bff',
};

/** People of the computer sides: the first is the other people, then they take turns. */
export function aiFaction(player: Faction, index: number): Faction {
  const other: Faction = player === 'human' ? 'alien' : 'human';
  return index % 2 === 0 ? other : player;
}

export const RELATION_NAMES = {
  war: 'Krieg',
  peace: 'Frieden',
  alliance: 'Bündnis',
} as const;
export type RelationKind = keyof typeof RELATION_NAMES;

/** Colors by relation to the player (health bars, markers). */
export const RELATION_COLORS: Record<RelationKind | 'self', string> = {
  self: '#7cff6b',
  alliance: '#5fd0ff',
  peace: '#ffd25a',
  war: '#ff5d6c',
};

/** Diplomacy rules. Change numbers here to balance the game. */
export const DIPLOMACY = {
  /** No new peace offer to a side that declared war (or got war) this recently. */
  warCooldownMs: 5 * 60_000,
  /** Peace must last this long before an alliance. */
  allianceAfterMs: 5 * 60_000,
  /** Offers to the player wait this long for an answer. */
  offerMs: 3 * 60_000,
  /** Online the other person may be away: offers wait a day. */
  onlineOfferMs: 24 * 60 * 60_000,
  /** The computer thinks about diplomacy this often. */
  thinkEveryMs: 60_000,
  /** After an offer to the player, the computer waits this long before the next one. */
  askAgainMs: 8 * 60_000,
} as const;

export type { AiId };
