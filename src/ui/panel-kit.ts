import type { ResourceAmounts } from '../content/resources';
import { el, formatDuration } from './dom';
import { costChips, icon, type IconName } from './icons';

/** Panel title with optional picture and small category line. */
export function header(title: string, sub: string, picture?: HTMLElement): HTMLElement {
  return el(
    'div',
    { class: 'p-head' },
    picture ? el('div', { class: 'p-pic' }, picture) : null,
    el('div', {}, el('div', { class: 'p-sub' }, sub), el('h3', {}, title)),
  );
}

export function levelPips(level: number, max: number): HTMLElement {
  const pips = Array.from({ length: max }, (_, i) =>
    el('span', { class: i < level ? 'pip on' : 'pip' }),
  );
  return el('div', { class: 'pips', title: `Stufe ${level} von ${max}` }, ...pips);
}

export function section(title: string, ...children: (HTMLElement | null)[]): HTMLElement {
  return el('div', { class: 'p-sec' }, el('h4', {}, title), ...children);
}

export function text(t: string, cls = 'p-text'): HTMLElement {
  return el('p', { class: cls }, t);
}

export function stat(ico: IconName, label: string, value: string, color?: string): HTMLElement {
  return el(
    'div',
    { class: 'stat' },
    icon(ico, color),
    el('span', { class: 'stat-l' }, label),
    el('span', { class: 'stat-v' }, value),
  );
}

/** Text timer, updated by the info panel every few frames. */
export function timer(until: number): HTMLElement {
  return el('span', { class: 'timer', 'data-until': String(until) }, '…');
}

/** Label, time left and a progress bar from `from` to `until`. */
export function progress(label: string, from: number, until: number): HTMLElement {
  return el(
    'div',
    { class: 'prog' },
    el('div', { class: 'prog-top' }, el('span', {}, label), timer(until)),
    el(
      'div',
      { class: 'prog-bar', 'data-from': String(from), 'data-until': String(until) },
      el('i'),
    ),
  );
}

export interface ActionOpts {
  cost?: ResourceAmounts;
  have?: ResourceAmounts;
  timeMs?: number;
  title?: string;
  disabled?: boolean;
  onclick(): void;
}

/** Big action button: icon, label, and cost/time on the right. */
export function action(ico: IconName, label: string, o: ActionOpts): HTMLElement {
  const right = el(
    'span',
    { class: 'act-r' },
    o.cost ? costChips(o.cost, o.have) : null,
    o.timeMs ? el('span', { class: 'act-time' }, icon('clock'), formatDuration(o.timeMs)) : null,
  );
  const b = el(
    'button',
    { class: 'act', onclick: o.onclick, title: o.title ?? label },
    icon(ico),
    el('span', { class: 'act-l' }, label),
    right,
  );
  if (o.disabled) b.disabled = true;
  return b;
}

/** Updates timers and progress bars inside root. */
export function tickTimers(root: HTMLElement, now: number): void {
  for (const t of root.querySelectorAll<HTMLElement>('.timer'))
    t.textContent = formatDuration(Number(t.dataset.until) - now);
  for (const b of root.querySelectorAll<HTMLElement>('.prog-bar')) {
    const from = Number(b.dataset.from);
    const until = Number(b.dataset.until);
    const p = Math.min(1, Math.max(0, (now - from) / Math.max(1, until - from)));
    const fill = b.firstElementChild as HTMLElement | null;
    if (fill) fill.style.width = `${(p * 100).toFixed(1)}%`;
  }
}
