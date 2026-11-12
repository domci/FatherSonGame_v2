import { digest } from '../src/net/digest';
import { HASH_EVERY, SEND_EVERY, type ErrorCode, type ServerMessage } from '../src/net/protocol';
import { applyCommand, COMMAND_TYPES, type Command } from '../src/sim/commands';
import type { SideId } from '../src/sim/entity';
import { freeSeats, SERVER_COMMANDS } from '../src/sim/online';
import { fromSaveData, toSaveData, type SaveData } from '../src/sim/save/save';
import type { Faction, GameState } from '../src/sim/state';
import { catchUp, tick, TICK_MS } from '../src/sim/update';

/** One open connection (a WebSocket on the server, a fake in tests). */
export interface Peer {
  send(text: string): void;
  close(code?: number, reason?: string): void;
}

export interface Member {
  account: string;
  side: SideId;
  name: string;
  /** Commands in the current second (limit against flooding). */
  sent: number;
  second: number;
}

/** Longer behind than this: calculate like offline and send everybody a fresh snapshot. */
const MAX_BEHIND_MS = 20_000;
const MAX_COMMANDS_PER_SECOND = 20;
/** At most one fresh snapshot for everybody in this time (when a browser asks). */
const RESYNC_GAP_MS = 5_000;

/**
 * The game of one online world on the server: runs the steps in real time, takes
 * commands from the people and sends them to every browser with their step number.
 */
export class RoomCore {
  readonly members = new Map<Peer, Member>();
  private tickNo = 0;
  private queue: Command[] = [];
  private out: [number, Command][] = [];
  private lastResync = -Infinity;

  constructor(
    public state: GameState,
    /** account id → seat */
    public seats: Record<string, SideId>,
    private now: () => number,
  ) {}

  /** Loads a saved world and calculates the time since then (like offline). */
  static load(save: SaveData, seats: Record<string, SideId>, now: () => number): RoomCore {
    const state = fromSaveData(save);
    catchUp(state, Math.max(0, now() - state.time));
    return new RoomCore(state, seats, now);
  }

  save(): SaveData {
    return toSaveData(this.state, this.now());
  }

  /** Runs the steps that are due. Called by a timer while somebody is connected. */
  advance(): void {
    if (this.now() - this.state.time > MAX_BEHIND_MS) {
      catchUp(this.state, this.now() - this.state.time);
      this.snapshotAll();
      return;
    }
    while (this.state.time + TICK_MS <= this.now()) this.runOne();
  }

  private runOne(): void {
    const cmds = this.queue;
    this.queue = [];
    for (const cmd of cmds) this.applyNow(cmd);
    tick(this.state);
    this.tickNo += 1;
    if (this.tickNo % SEND_EVERY === 0) this.flush();
    if (this.tickNo % HASH_EVERY === 0)
      this.broadcast({ t: 'hash', tick: this.tickNo, h: digest(this.state) });
  }

  /** Applies a command before the next step and tells all browsers (same step, same order). */
  private applyNow(cmd: Command): void {
    try {
      applyCommand(this.state, cmd);
    } catch (e) {
      console.warn('command failed', cmd.type, e);
    }
    this.out.push([this.tickNo, cmd]);
  }

  private flush(): void {
    this.broadcast({ t: 'steps', to: this.tickNo, cmds: this.out });
    this.out = [];
  }

  broadcast(msg: ServerMessage): void {
    const text = JSON.stringify(msg);
    for (const peer of this.members.keys()) peer.send(text);
  }

  /**
   * A person connects (account already checked). New people take a free seat.
   * Everybody gets a fresh snapshot, so all browsers start from the same data.
   */
  connect(
    peer: Peer,
    who: { account: string; name: string; faction: Faction },
    welcome: (side: SideId) => ServerMessage,
  ): ErrorCode | undefined {
    const { account, name, faction } = who;
    let side = this.seats[account];
    if (!side) {
      side = freeSeats(this.state)[0];
      if (!side) return 'full';
      this.seats[account] = side;
      this.applyNow({ type: 'join', player: side, faction, name });
    }
    for (const [p, m] of this.members)
      if (m.account === account) {
        this.disconnect(p);
        p.close(4000, 'Auf einem anderen Gerät geöffnet.');
      }
    this.members.set(peer, { account, side, name, sent: 0, second: 0 });
    peer.send(JSON.stringify(welcome(side)));
    this.applyNow({ type: 'presence', player: side, here: true });
    this.snapshotAll();
    return undefined;
  }

  disconnect(peer: Peer): void {
    const m = this.members.get(peer);
    if (!m) return;
    this.members.delete(peer);
    const still = [...this.members.values()].some((x) => x.side === m.side);
    if (!still && this.state.players[m.side])
      this.applyNow({ type: 'presence', player: m.side, here: false });
  }

  /** A command from a browser: only normal commands, always for the own seat, not too many. */
  command(peer: Peer, cmd: Command): void {
    const m = this.members.get(peer);
    if (!m || typeof cmd !== 'object' || !COMMAND_TYPES.includes(cmd.type)) return;
    if (SERVER_COMMANDS.includes(cmd.type)) return;
    const second = Math.floor(this.now() / 1000);
    if (second !== m.second) [m.second, m.sent] = [second, 0];
    if (++m.sent > MAX_COMMANDS_PER_SECOND) return;
    this.queue.push({ ...cmd, player: m.side } as Command);
  }

  /** A browser went a different way (or fell behind): fresh snapshot for everybody. */
  resync(): void {
    if (this.now() - this.lastResync < RESYNC_GAP_MS) return;
    this.snapshotAll();
  }

  /** Save and load the server copy too, so that it has the same inner order as the browsers. */
  private snapshotAll(): void {
    this.lastResync = this.now();
    const save = toSaveData(this.state, this.now());
    this.state = fromSaveData(save);
    this.out = [];
    this.broadcast({ t: 'snapshot', tick: this.tickNo, save });
  }

  /** The current tick (for the welcome message). */
  get step(): number {
    return this.tickNo;
  }

  /** A person left the world for good (account deleted): the seat is free again. */
  removeAccount(account: string): void {
    const side = this.seats[account];
    if (!side) return;
    for (const [p, m] of this.members) if (m.account === account) this.disconnect(p);
    this.seats = Object.fromEntries(Object.entries(this.seats).filter(([a]) => a !== account));
    if (side !== 'player') this.applyNow({ type: 'leave', player: side });
  }
}
