import type { Difficulty } from '../content/ai';
import type { Command } from '../sim/commands';
import type { SideId } from '../sim/entity';
import type { SaveData } from '../sim/save/save';
import type { Faction } from '../sim/state';

/**
 * Messages between the browser and the world server (M7), as JSON over a WebSocket.
 * The server runs the game; browsers replay the same commands at the same step
 * ("lockstep"), check a fingerprint now and then and get a fresh snapshot when needed.
 */

/** Who can read a chat line: everybody in the world, your allies, or one person. */
export type ChatTo = { kind: 'world' } | { kind: 'allies' } | { kind: 'side'; side: SideId };

export interface ChatLine {
  id: string;
  time: number;
  from: SideId;
  name: string;
  to: ChatTo;
  text: string;
  /** A ready-made message (no check needed). */
  quick?: boolean;
}

export type ClientMessage =
  | { t: 'hello'; account: string; key: string; build: string; faction?: Faction }
  | { t: 'cmd'; cmd: Command }
  | { t: 'resync' }
  | { t: 'ping' }
  | { t: 'chat'; to: ChatTo; text?: string; quick?: number }
  | { t: 'report'; id: string };

export type ErrorCode = 'reload' | 'auth' | 'full' | 'banned' | 'gone';

export type ServerMessage =
  | { t: 'welcome'; side: SideId; chat: ChatLine[]; world: WorldInfo }
  | { t: 'snapshot'; tick: number; save: SaveData }
  | { t: 'steps'; to: number; cmds: [number, Command][] }
  | { t: 'hash'; tick: number; h: string }
  | { t: 'chat'; line: ChatLine }
  | { t: 'notice'; text: string; kind: 'info' | 'bad' }
  | { t: 'error'; code: ErrorCode; text: string }
  | { t: 'pong' };

/** A world as the lobby shows it. */
export interface WorldInfo {
  id: string;
  /** Short code to join (6 letters). */
  code: string;
  name: string;
  difficulty: Difficulty;
  computers: number;
  people: number;
  /** Seats taken by people. */
  taken: number;
  open: boolean;
  /** Your seat, if you play there. */
  side?: SideId;
}

/** What a new world needs (from the "Neue Welt" dialog). */
export interface NewWorld {
  name: string;
  difficulty: Difficulty;
  computers: number;
  people: number;
  open: boolean;
  faction: Faction;
}

/** Your account, as the server sends it back. The key stays on your device. */
export interface AccountInfo {
  id: string;
  name: string;
  /** Chat is off until this time (a punishment), 0 = free. */
  chatBanUntil: number;
  strikes: number;
}

/** A reported chat line (parents' page). */
export interface ReportInfo {
  id: string;
  time: number;
  world: string;
  /** Account ids. */
  reporter: string;
  offender: string;
  /** Name and text of the reported line. */
  name: string;
  text: string;
}

/** What parents can do with a report: close it, warn the writer, or ban the writer. */
export type ReportAction = 'dismiss' | 'strike' | 'ban';

/** Steps between two fingerprints (5 seconds). */
export const HASH_EVERY = 50;
/** Steps the server sends together (0.2 seconds). */
export const SEND_EVERY = 2;
