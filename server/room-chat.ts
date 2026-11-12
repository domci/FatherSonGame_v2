import { CHAT_KEEP, QUICK_MESSAGES } from '../src/content/chat';
import type { ChatLine, ChatTo } from '../src/net/protocol';
import type { SideId } from '../src/sim/entity';
import { allied } from '../src/sim/relations';
import type { GameState } from '../src/sim/state';
import { checkRules } from './chat-rules';
import type { Moderator } from './moderation';

export interface Sender {
  side: SideId;
  name: string;
  /** Chat pause until this time (0 = free). */
  chatBanUntil: number;
}

/** A line to send, or why not (strike = the person broke the rules). */
export type PostResult =
  { ok: true; line: ChatLine } | { ok: false; text: string; strike: boolean };

/** Can this side read the line? */
export function canRead(state: GameState, side: SideId, line: ChatLine): boolean {
  if (line.from === side || line.to.kind === 'world') return true;
  if (line.to.kind === 'allies') return allied(state, side, line.from);
  return line.to.side === side;
}

function minutes(ms: number): string {
  const m = Math.ceil(ms / 60_000);
  return m >= 120 ? `${Math.ceil(m / 60)} Stunden` : `${m} Minuten`;
}

/** The chat of one world: checks each message, keeps the last lines for a week. */
export class RoomChat {
  lines: ChatLine[] = [];
  private nextId = 1;

  constructor(
    private mod: Moderator,
    private now: () => number,
  ) {}

  /** Ready-made message (number) or free text (checked by rules, then by the AI). */
  async post(
    from: Sender,
    to: ChatTo,
    msg: { text?: string; quick?: number },
  ): Promise<PostResult> {
    const quick = msg.quick === undefined ? undefined : QUICK_MESSAGES[msg.quick];
    if (quick) return { ok: true, line: this.add(from, to, quick, true) };
    const text = (msg.text ?? '').trim();
    const pause = from.chatBanUntil - this.now();
    if (pause > 0)
      return {
        ok: false,
        strike: false,
        text: `Chat-Pause noch ${minutes(pause)}. Schnell-Nachrichten gehen.`,
      };
    const rule = checkRules(text);
    if (rule) return { ok: false, ...rule };
    const verdict = await this.mod.check(text);
    if (verdict === 'blocked')
      return { ok: false, strike: true, text: 'Diese Nachricht ist nicht erlaubt.' };
    if (verdict === 'unavailable')
      return {
        ok: false,
        strike: false,
        text: 'Die Chat-Prüfung geht gerade nicht. Nutzt die Schnell-Nachrichten.',
      };
    return { ok: true, line: this.add(from, to, text, false) };
  }

  private add(from: Sender, to: ChatTo, text: string, quick: boolean): ChatLine {
    const line: ChatLine = {
      id: `${this.now()}-${this.nextId++}`,
      time: this.now(),
      from: from.side,
      name: from.name,
      to,
      text,
    };
    if (quick) line.quick = true;
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
