import { RESOURCE_IDS, RESOURCE_INFO } from '../content/resources';
import type { CatchUpReport } from '../sim/update';
import type { GameEvent } from '../sim/state';
import { el, formatDuration, formatNumber } from './dom';

/** "While you were away …" window after loading. */
export function awayReport(
  report: CatchUpReport,
  events: GameEvent[],
  onClose: () => void,
): HTMLElement {
  const gains = RESOURCE_IDS.filter((id) => report.gained[id]).map((id) => {
    const v = report.gained[id] ?? 0;
    return el(
      'li',
      {},
      `${RESOURCE_INFO[id].icon} ${RESOURCE_INFO[id].name}: ${v > 0 ? '+' : ''}${formatNumber(v)}`,
    );
  });
  const happened = events
    .slice(report.eventsBefore)
    .slice(-8)
    .map((e) => el('li', {}, e.text));
  const overlay = el(
    'div',
    { class: 'overlay' },
    el(
      'div',
      { class: 'card' },
      el('h2', {}, 'Während du weg warst …'),
      el('p', { class: 'muted' }, `Du warst ${formatDuration(report.elapsedMs)} weg.`),
      gains.length ? el('ul', {}, ...gains) : el('p', {}, 'Keine neuen Rohstoffe.'),
      happened.length ? el('ul', {}, ...happened) : null,
      el('button', { class: 'big', onclick: () => close(overlay, onClose) }, 'Weiter'),
    ),
  );
  return overlay;
}

function close(overlay: HTMLElement, onClose: () => void): void {
  overlay.remove();
  onClose();
}
