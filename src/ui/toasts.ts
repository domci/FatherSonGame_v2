import type { Session } from '../app/session';
import type { SideId } from '../sim/entity';
import type { GameEvent } from '../sim/state';
import { el } from './dom';
import { icon, type IconName } from './icons';

const ICON: Record<GameEvent['kind'], IconName> = {
  info: 'info',
  good: 'circle-check',
  bad: 'triangle-alert',
};

/**
 * News for one side that came after the last seen one. Found by time and text, not by
 * object, because online the whole game state can be replaced by a fresh copy.
 */
export function freshEvents(
  events: readonly GameEvent[],
  me: SideId,
  seen: { time: number; texts: Set<string> },
): GameEvent[] {
  const fresh = events.filter(
    (e) => e.time > seen.time || (e.time === seen.time && !seen.texts.has(e.text)),
  );
  const last = events.at(-1);
  if (last && last.time !== seen.time) seen.texts.clear();
  if (last) seen.time = last.time;
  for (const e of events) if (e.time === seen.time) seen.texts.add(e.text);
  return fresh.filter((e) => !e.to || e.to === me);
}

/** Short messages that appear and fade away. */
export class Toasts {
  readonly root = el('div', { class: 'toasts' });
  private seen = { time: -Infinity, texts: new Set<string>() };

  constructor(private session: Session) {
    freshEvents(session.state.events, session.me, this.seen);
    session.onMessage = (text, kind) => this.show(text, kind);
  }

  update(): void {
    const fresh = freshEvents(this.session.state.events, this.session.me, this.seen);
    for (const e of fresh.slice(-4)) this.show(e.text, e.kind);
  }

  show(text: string, kind: GameEvent['kind']): void {
    const t = el('div', { class: `toast ${kind}` }, icon(ICON[kind]), el('span', {}, text));
    this.root.prepend(t);
    while (this.root.children.length > 4) this.root.lastElementChild?.remove();
    window.setTimeout(() => t.classList.add('out'), 3500);
    window.setTimeout(() => t.remove(), 4200);
  }
}
