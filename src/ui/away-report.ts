import { RESOURCE_IDS, RESOURCE_INFO } from '../content/resources';
import type { CatchUpReport } from '../sim/update';
import type { GameEvent } from '../sim/state';
import { el, formatDuration, formatNumber } from './dom';
import { icon, resourceIcon } from './icons';

function gainRows(report: CatchUpReport): HTMLElement[] {
  return RESOURCE_IDS.filter((id) => report.gained[id]).map((id) => {
    const v = report.gained[id] ?? 0;
    return el(
      'div',
      { class: 'stat' },
      resourceIcon(id),
      el('span', { class: 'stat-l' }, RESOURCE_INFO[id].name),
      el(
        'span',
        { class: v >= 0 ? 'stat-v good' : 'stat-v bad' },
        `${v > 0 ? '+' : ''}${formatNumber(v)}`,
      ),
    );
  });
}

/** "While you were away …" window after loading. */
export function awayReport(
  report: CatchUpReport,
  events: GameEvent[],
  onClose: () => void,
): HTMLElement {
  const gains = gainRows(report);
  const happened = events
    .slice(report.eventsBefore)
    .slice(-8)
    .map((e) => el('li', {}, e.text));
  const overlay = el(
    'div',
    { class: 'screen modal' },
    el(
      'div',
      { class: 'panel dialog' },
      el('div', { class: 'p-sub' }, `Du warst ${formatDuration(report.elapsedMs)} weg`),
      el('h2', {}, 'Während du weg warst …'),
      gains.length
        ? el('div', { class: 'p-sec' }, ...gains)
        : el('p', { class: 'p-text' }, 'Keine neuen Rohstoffe.'),
      happened.length ? el('ul', { class: 'log' }, ...happened) : null,
      el(
        'button',
        { class: 'm-item primary', onclick: () => close(overlay, onClose) },
        icon('play'),
        el('span', {}, 'Weiter'),
      ),
    ),
  );
  return overlay;
}

function close(overlay: HTMLElement, onClose: () => void): void {
  overlay.remove();
  onClose();
}
