import { RESOURCE_IDS, RESOURCE_INFO } from '../content/resources';
import type { CatchUpReport } from '../sim/update';
import type { GameEvent } from '../sim/state';
import { el, formatDuration, formatNumber } from './dom';
import { icon, resourceIcon } from './icons';
import { t, tx } from '../i18n';

function gainRows(report: CatchUpReport): HTMLElement[] {
  return RESOURCE_IDS.filter((id) => report.gained[id]).map((id) => {
    const v = report.gained[id] ?? 0;
    return el(
      'div',
      { class: 'stat' },
      resourceIcon(id),
      el('span', { class: 'stat-l' }, tx(RESOURCE_INFO[id].name)),
      el(
        'span',
        { class: v >= 0 ? 'stat-v good' : 'stat-v bad' },
        `${v > 0 ? '+' : ''}${formatNumber(v)}`,
      ),
    );
  });
}

/** What the offline fight cost (only when offline attacks are on). */
function battleRows(report: CatchUpReport): HTMLElement | null {
  const b = report.battle;
  if (!b) return null;
  const line = (text: string, cls = 'p-text'): HTMLElement => el('p', { class: cls }, text);
  return el(
    'div',
    { class: 'p-sec' },
    el('h4', {}, t('attack')),
    line(t('beaten', { n: b.defeated }), 'p-text good'),
    line(t('lostB', { n: b.lostBuildings }), b.lostBuildings ? 'p-text bad' : 'p-text'),
    line(t('lostU', { n: b.lostUnits }), b.lostUnits ? 'p-text bad' : 'p-text'),
  );
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
    .map((e) => el('li', {}, tx(e.text)));
  const overlay = el(
    'div',
    { class: 'screen modal' },
    el(
      'div',
      { class: 'panel dialog' },
      el('div', { class: 'p-sub' }, t('awayFor', { t: formatDuration(report.elapsedMs) })),
      el('h2', {}, t('whileAway')),
      gains.length
        ? el('div', { class: 'p-sec' }, ...gains)
        : el('p', { class: 'p-text' }, t('noRes')),
      battleRows(report),
      happened.length ? el('ul', { class: 'log' }, ...happened) : null,
      el(
        'button',
        { class: 'm-item primary', onclick: () => close(overlay, onClose) },
        icon('play'),
        el('span', {}, t('next')),
      ),
    ),
  );
  return overlay;
}

function close(overlay: HTMLElement, onClose: () => void): void {
  overlay.remove();
  onClose();
}
