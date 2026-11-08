import type { Session } from '../app/session';
import type { GameEvent } from '../sim/state';
import { el } from './dom';

/** Short messages that appear and fade away. */
export class Toasts {
  readonly root = el('div', { class: 'toasts' });
  private last: GameEvent | undefined;

  constructor(private session: Session) {
    this.last = session.state.events.at(-1);
    session.onMessage = (text, kind) => this.show(text, kind);
  }

  update(): void {
    const events = this.session.state.events;
    const fresh = this.last ? events.slice(events.lastIndexOf(this.last) + 1) : events;
    for (const e of fresh.slice(-4)) this.show(e.text, e.kind);
    this.last = events.at(-1);
  }

  show(text: string, kind: 'info' | 'good' | 'bad'): void {
    const t = el('div', { class: `toast ${kind}` }, text);
    this.root.prepend(t);
    while (this.root.children.length > 4) this.root.lastElementChild?.remove();
    window.setTimeout(() => t.classList.add('out'), 3500);
    window.setTimeout(() => t.remove(), 4200);
  }
}
