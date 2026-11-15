import { CHAT_KEEP, QUICK_MESSAGES } from '../src/content/chat';
import type { ChatLine, ChatTo } from '../src/net/protocol';
import type { SideId } from '../src/sim/entity';
import { allied } from '../src/sim/relations';
import type { GameState } from '../src/sim/state';
import { checkRules } from './chat-rules';
import type { Moderator } from './moderation';
import { L, fmt, type Loc } from '../src/content/text';
import { SERVER_TEXT } from './texts';
import { LIMITS } from '../src/content/online';
import { RateWindow } from './rate';

export interface Sender {
  side: SideId;
  name: string;
  /** Chat pause until this time (0 = free). */
  chatBanUntil: number;
}

/** A line to send, or why not (strike = the person broke the rules). */
export type PostResult = { ok: true; line: ChatLine } | { ok: false; text: Loc; strike: boolean };

/** Can this side read the line? */
export function canRead(state: GameState, side: SideId, line: ChatLine): boolean {
  if (line.from === side || line.to.kind === 'world') return true;
  if (line.to.kind === 'allies') return allied(state, side, line.from);
  return line.to.side === side;
}

function minutes(ms: number): Loc {
  const m = Math.ceil(ms / 60_000);
  if (m >= 120) return fmt(L('{n} Stunden', '{n} hours'), { n: Math.ceil(m / 60) });
  return fmt(L('{n} Minuten', '{n} minutes'), { n: m });
}

/** The chat of one world: checks each message, keeps the last lines for a week. */
export class RoomChat {
  lines: ChatLine[] = [];
  /** Open worlds (strangers): only ready-made messages, no own text. */
  quickOnly = false;
  private nextId = 1;
  private texts: RateWindow;

  constructor(
    private mod: Moderator,
    private now: () => number,
  ) {
    this.texts = new RateWindow(LIMITS.textsPerWindow, LIMITS.textWindowMs, now);
  }

  /** Ready-made message (number) or free text (checked by rules, then by the AI). */
  async post(
    from: Sender,
    to: ChatTo,
    msg: { text?: string; quick?: number },
  ): Promise<PostResult> {
    const quick = msg.quick === undefined ? undefined : QUICK_MESSAGES[msg.quick];
    if (quick && msg.quick !== undefined)
      return { ok: true, line: this.add(from, to, quick.de, msg.quick) };
    const text = (msg.text ?? '').trim();
    const stop = this.blocked(from);
    if (stop) return { ok: false, strike: false, text: stop };
    const rule = checkRules(text);
    if (rule) return { ok: false, ...rule };
    if (!this.texts.take(from.side))
      return { ok: false, strike: false, text: SERVER_TEXT.textBudget };
    const verdict = await this.mod.check(text);
    if (verdict === 'blocked')
      return {
        ok: false,
        strike: true,
        text: SERVER_TEXT.notAllowed,
      };
    if (verdict === 'unavailable')
      return {
        ok: false,
        strike: false,
        text: SERVER_TEXT.noCheck,
      };
    return { ok: true, line: this.add(from, to, text) };
  }

  /** Why this person may not write own text now (or nothing). */
  private blocked(from: Sender): Loc | undefined {
    if (this.quickOnly) return SERVER_TEXT.quickOnly;
    const pause = from.chatBanUntil - this.now();
    return pause > 0 ? fmt(SERVER_TEXT.chatPause, { t: minutes(pause) }) : undefined;
  }

  private add(from: Sender, to: ChatTo, text: string, quick?: number): ChatLine {
    const line: ChatLine = {
      id: `${this.now()}-${this.nextId++}`,
      time: this.now(),
      from: from.side,
      name: from.name,
      to,
      text,
    };
    if (quick !== undefined) line.quick = quick;
    this.lines.push(line);
    this.trim();
    return line;
  }

  /** Old lines go away (data protection: nothing is kept for long). */
  trim(): void {
    const since = this.now() - CHAT_KEEP.ms;
    this.lines = this.lines.filter((l) => l.time >= since).slice(-CHAT_KEEP.lines);
  }

  find(id: string): ChatLine | undefined {
    return this.lines.find((l) => l.id === id);
  }
}
