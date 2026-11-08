import {
  RESOURCE_IDS,
  RESOURCE_INFO,
  type ResourceAmounts,
  type ResourceId,
} from '../content/resources';
import { el, formatNumber } from './dom';
import { ICON_DATA, type IconName } from './icon-data';

export type { IconName };

export const RESOURCE_ICON: Record<ResourceId, IconName> = {
  regolith: 'mountain',
  metal: 'box',
  gas: 'cloud',
  diamonds: 'gem',
  pinkLiquid: 'flask-conical',
  water: 'droplet',
  oxygen: 'wind',
  food: 'wheat',
};

/** An inline SVG icon (Lucide). Color comes from CSS `color` unless given. */
export function icon(name: IconName, color?: string): HTMLElement {
  const span = el('span', { class: 'ico', 'aria-hidden': 'true' });
  span.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON_DATA[name]}</svg>`;
  if (color) span.style.color = color;
  return span;
}

export function resourceIcon(id: ResourceId): HTMLElement {
  return icon(RESOURCE_ICON[id], RESOURCE_INFO[id].color);
}

/** Small cost chips: [icon 60] [icon 10]. Red when the player has too little. */
export function costChips(cost: ResourceAmounts, have?: ResourceAmounts): HTMLElement {
  const ids = RESOURCE_IDS.filter((id) => cost[id]);
  if (!ids.length) return el('span', { class: 'cost free' }, 'gratis');
  return el(
    'span',
    { class: 'cost' },
    ...ids.map((id) => {
      const need = cost[id] ?? 0;
      const short = have !== undefined && (have[id] ?? 0) < need;
      return el(
        'span',
        { class: short ? 'chip-cost short' : 'chip-cost', title: RESOURCE_INFO[id].name },
        resourceIcon(id),
        formatNumber(need),
      );
    }),
  );
}
