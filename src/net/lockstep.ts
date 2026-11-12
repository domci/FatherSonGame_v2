import { applyCommand, type Command } from '../sim/commands';
import type { SideId } from '../sim/entity';
import { fromSaveData } from '../sim/save/save';
import type { GameState } from '../sim/state';
import { tick } from '../sim/update';
import { setViewer } from '../sim/viewer';
import { digest } from './digest';
import type { ServerMessage } from './protocol';

/**
 * The browser side of an online game: replays the steps of the server with the same
 * commands at the same step. Pure logic (no DOM), so tests can run it next to the server.
 */
export class Lockstep {
  state?: GameState;
  side: SideId = 'player';
  /** Steps done here. */
  done = 0;
  /** Steps the server has done (we may run up to here). */
  private to = 0;
  private cmds: [number, Command][] = [];
  private hashes = new Map<number, string>();
  /** One of our own commands did not work (reason for a message). */
  onFail: (reason: string) => void = () => undefined;
  /** We went a different way than the server: ask for a fresh snapshot. */
  onMismatch: () => void = () => undefined;
  /** A new game state arrived (first one, or after a resync). */
  onSnapshot: (state: GameState) => void = () => undefined;

  receive(msg: ServerMessage): void {
    if (msg.t === 'snapshot') {
      this.state = fromSaveData(msg.save);
      setViewer(this.state, this.side);
      this.done = this.to = msg.tick;
      this.cmds = [];
      this.hashes.clear();
      this.onSnapshot(this.state);
    } else if (msg.t === 'steps') {
      this.cmds.push(...msg.cmds);
      this.to = Math.max(this.to, msg.to);
    } else if (msg.t === 'hash') {
      this.hashes.set(msg.tick, msg.h);
    } else if (msg.t === 'welcome') {
      this.side = msg.side;
    }
  }

  /** Steps the server is ahead of us. */
  get backlog(): number {
    return this.to - this.done;
  }

  /** Runs up to `max` steps that the server has already done. Returns how many ran. */
  run(max: number): number {
    const state = this.state;
    if (!state) return 0;
    let n = 0;
    while (this.done < this.to && n < max) {
      this.applyDue(state);
      tick(state);
      this.done += 1;
      n += 1;
      this.check(state);
    }
    return n;
  }

  private applyDue(state: GameState): void {
    while (this.cmds.length > 0 && (this.cmds[0]?.[0] ?? Infinity) <= this.done) {
      const [at, cmd] = this.cmds.shift() as [number, Command];
      if (at < this.done) continue;
      const result = safeApply(state, cmd);
      if (!result.ok && cmd.player === this.side) this.onFail(result.reason);
    }
  }

  private check(state: GameState): void {
    const h = this.hashes.get(this.done);
    if (h === undefined) return;
    this.hashes.delete(this.done);
    if (h !== digest(state)) this.onMismatch();
  }
}

function safeApply(state: GameState, cmd: Command): { ok: true } | { ok: false; reason: string } {
  try {
    return applyCommand(state, cmd);
  } catch {
    return { ok: false, reason: 'Befehl ging nicht.' };
  }
}
