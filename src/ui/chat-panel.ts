import { CHAT_MAX, CHAT_RULES, QUICK_MESSAGES } from '../content/chat';
import type { ChatLine, ChatTo } from '../net/protocol';
import type { SideId } from '../sim/entity';
import type { LinkStatus } from '../online/online-game';
import { el } from './dom';
import { icon } from './icons';

/** What the chat window needs from the online game. */
export interface ChatSource {
  readonly chat: readonly ChatLine[];
  readonly me: SideId;
  readonly status: LinkStatus;
  say(to: ChatTo, text: string | number): void;
  report(lineId: string): void;
}

const TO_TEXT: Record<ChatTo['kind'], string> = {
  world: 'Alle',
  allies: 'Verbündete',
  side: 'Privat',
};

/** Lines from others that came after `since` (for the red dot on the chat button). */
export function unreadCount(lines: readonly ChatLine[], me: SideId, since: number): number {
  return lines.filter((l) => l.time > since && l.from !== me).length;
}

/** Chat window: lines, ready-made messages, own text (checked by the server), report button. */
export class ChatPanel {
  readonly root = el('div', { class: 'panel chat-panel', hidden: true });
  readonly button = el('button', { class: 'seg-btn chat-btn', title: 'Chat' });
  private list = el('div', { class: 'chat-list' });
  private input = el('input', { class: 'chat-input', maxlength: String(CHAT_MAX) });
  private rules = el('ul', { class: 'chat-rules', hidden: true });
  private to: ChatTo = { kind: 'world' };
  private shownKey = '';
  private seenTime = 0;
  private reported = new Set<string>();

  constructor(private src: ChatSource) {
    this.button.append(icon('message-circle'), el('span', { class: 'dot' }));
    this.button.onclick = () => this.toggle();
    this.input.placeholder = 'Nachricht …';
    this.input.onkeydown = (e) => e.key === 'Enter' && this.sendText();
    for (const rule of CHAT_RULES) this.rules.append(el('li', {}, rule));
    this.root.append(this.head(), this.rules, this.list, this.quickRow(), this.inputRow());
  }

  toggle(): void {
    this.root.hidden = !this.root.hidden;
    this.button.classList.toggle('on', !this.root.hidden);
    this.update();
  }

  update(): void {
    const lines = this.src.chat;
    const last = lines.at(-1);
    if (!this.root.hidden && last) this.seenTime = Math.max(this.seenTime, last.time);
    const unread = unreadCount(lines, this.src.me, this.seenTime);
    this.button.classList.toggle('unread', unread > 0);
    this.button.classList.toggle('lost', this.src.status !== 'online');
    const key = `${lines.length}:${last?.id ?? ''}`;
    if (this.root.hidden || key === this.shownKey) return;
    this.shownKey = key;
    this.list.replaceChildren(...lines.map((l) => this.line(l)));
    this.list.scrollTop = this.list.scrollHeight;
  }

  private head(): HTMLElement {
    const kinds: ChatTo['kind'][] = ['world', 'allies'];
    const buttons = kinds.map((kind) =>
      el(
        'button',
        {
          class: kind === this.to.kind ? 'seg-btn on' : 'seg-btn',
          onclick: () => {
            this.to = { kind } as ChatTo;
            buttons.forEach((b, i) => b.classList.toggle('on', kinds[i] === kind));
          },
        },
        `An: ${TO_TEXT[kind]}`,
      ),
    );
    return el(
      'div',
      { class: 'chat-head' },
      el('div', { class: 'panel seg' }, ...buttons),
      el(
        'button',
        { class: 'seg-btn', title: 'Chat-Regeln', onclick: () => this.toggleRules() },
        icon('info'),
      ),
      el(
        'button',
        { class: 'seg-btn', title: 'Schließen', onclick: () => this.toggle() },
        icon('x'),
      ),
    );
  }

  private toggleRules(): void {
    this.rules.hidden = !this.rules.hidden;
  }

  private line(l: ChatLine): HTMLElement {
    const mine = l.from === this.src.me;
    const tag =
      l.to.kind === 'world' ? undefined : el('span', { class: 'chat-tag' }, TO_TEXT[l.to.kind]);
    const row = el(
      'div',
      { class: mine ? 'chat-line mine' : 'chat-line' },
      el('span', { class: 'chat-name' }, l.name),
      tag,
      el('span', { class: 'chat-text' }, l.text),
    );
    if (!mine && !l.quick) row.append(this.reportButton(l.id));
    return row;
  }

  private reportButton(id: string): HTMLElement {
    const done = this.reported.has(id);
    const b = el('button', { class: 'chat-report', title: 'Melden' }, icon('flag'));
    b.toggleAttribute('disabled', done);
    b.onclick = () => {
      this.reported.add(id);
      b.setAttribute('disabled', '');
      this.src.report(id);
    };
    return b;
  }

  private quickRow(): HTMLElement {
    return el(
      'div',
      { class: 'chat-quick' },
      ...QUICK_MESSAGES.map((text, i) =>
        el('button', { class: 'chip', onclick: () => this.src.say(this.to, i) }, text),
      ),
    );
  }

  private inputRow(): HTMLElement {
    return el(
      'div',
      { class: 'chat-send' },
      this.input,
      el(
        'button',
        { class: 'seg-btn', title: 'Senden', onclick: () => this.sendText() },
        icon('send'),
      ),
    );
  }

  private sendText(): void {
    const text = this.input.value.trim();
    if (!text) return;
    this.src.say(this.to, text);
    this.input.value = '';
  }
}
