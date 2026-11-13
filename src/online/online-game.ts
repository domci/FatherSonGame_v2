import { Lockstep } from '../net/lockstep';
import type {
  ChatLine,
  ChatTo,
  ClientMessage,
  ErrorCode,
  ServerMessage,
  WorldInfo,
} from '../net/protocol';
import type { Command } from '../sim/commands';
import type { SideId } from '../sim/entity';
import type { GameState } from '../sim/state';

export type LinkStatus = 'connecting' | 'online' | 'lost' | 'closed';

/** The line to the world server (a WebSocket in the browser, a fake in tests). */
export interface Link {
  onMessage: (msg: ServerMessage) => void;
  onStatus: (s: LinkStatus) => void;
  open(): void;
  send(msg: ClientMessage): void;
  close(): void;
}

/** The server said no (old version, unknown account, world full, banned, world gone). */
export class OnlineError extends Error {
  constructor(
    readonly code: ErrorCode,
    text: string,
  ) {
    super(text);
  }
}

/** Ask for a fresh snapshot at most this often. */
const RESYNC_GAP_MS = 5000;
/** Run up to this many steps per game step when we are behind (about 0.1 s of work). */
const MAX_CATCH_UP = 200;
const CHAT_SHOWN = 100;

/** One online world in this browser: replays the server, sends commands and chat. */
export class OnlineGame {
  readonly lockstep = new Lockstep();
  chat: ChatLine[] = [];
  world?: WorldInfo;
  status: LinkStatus = 'connecting';
  /** A fresh game state from the server (the game screen swaps it in). */
  onState: (state: GameState) => void = () => undefined;
  onChat: (line: ChatLine) => void = () => undefined;
  onNotice: (text: string, kind: 'info' | 'bad') => void = () => undefined;
  /** The server said no while playing (the game screen goes back to the lobby). */
  onError: (e: OnlineError) => void = () => undefined;
  private lastResync = -Infinity;
  private first?: { ok: (s: GameState) => void; no: (e: OnlineError) => void };

  constructor(
    private link: Link,
    private now: () => number = Date.now,
  ) {
    link.onMessage = (m) => this.receive(m);
    link.onStatus = (s) => (this.status = s);
    this.lockstep.onMismatch = () => this.resync();
    this.lockstep.onFail = (reason) => this.onNotice(reason, 'bad');
    this.lockstep.onSnapshot = (s) => this.snapshot(s);
  }

  /** The seat of this browser. */
  get me(): SideId {
    return this.lockstep.side;
  }

  /** Connects; gives the first game state from the server (or a problem after `waitMs`). */
  start(waitMs = 20_000): Promise<GameState> {
    return new Promise((ok, no) => {
      const timer = setTimeout(
        () => this.fail(new OnlineError('gone', 'Der Server antwortet nicht. Später noch mal!')),
        waitMs,
      );
      this.first = {
        ok: (s) => (clearTimeout(timer), ok(s)),
        no: (e) => (clearTimeout(timer), no(e)),
      };
      this.link.open();
    });
  }

  /**
   * Every game step (100 ms): runs what the server has done. When we are behind (slow
   * device, hidden tab), jump to near the server at once; keep 2 steps as a cushion.
   */
  step(): void {
    const behind = this.lockstep.backlog;
    this.lockstep.run(behind > 4 ? Math.min(MAX_CATCH_UP, behind - 2) : 1);
  }

  send(cmd: Command): void {
    this.link.send({ t: 'cmd', cmd });
  }

  say(to: ChatTo, text: string | number): void {
    this.link.send(
      typeof text === 'number' ? { t: 'chat', to, quick: text } : { t: 'chat', to, text },
    );
  }

  report(lineId: string): void {
    this.link.send({ t: 'report', id: lineId });
  }

  leave(): void {
    this.link.close();
  }

  private receive(msg: ServerMessage): void {
    this.lockstep.receive(msg);
    if (msg.t === 'welcome') {
      this.world = msg.world;
      this.chat = msg.chat.slice(-CHAT_SHOWN);
    } else if (msg.t === 'chat') {
      this.chat.push(msg.line);
      if (this.chat.length > CHAT_SHOWN) this.chat.shift();
      this.onChat(msg.line);
    } else if (msg.t === 'notice') this.onNotice(msg.text, msg.kind);
    else if (msg.t === 'error') this.fail(new OnlineError(msg.code, msg.text));
  }

  private snapshot(state: GameState): void {
    const first = this.first;
    this.first = undefined;
    if (first) first.ok(state);
    else this.onState(state);
  }

  private fail(e: OnlineError): void {
    const first = this.first;
    this.first = undefined;
    if (first) first.no(e);
    else this.onError(e);
  }

  private resync(): void {
    if (this.now() - this.lastResync < RESYNC_GAP_MS) return;
    this.lastResync = this.now();
    this.link.send({ t: 'resync' });
  }
}
