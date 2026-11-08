import { RESOURCE_IDS, RESOURCE_INFO, type ResourceAmounts } from '../content/resources';
import { formatNumber } from './dom';

/** "60 Regolith, 10 Wasser" (for tooltips). */
export function costText(cost: ResourceAmounts): string {
  const parts = RESOURCE_IDS.filter((id) => cost[id]).map(
    (id) => `${formatNumber(cost[id] ?? 0)} ${RESOURCE_INFO[id].name}`,
  );
  return parts.length ? parts.join(', ') : 'gratis';
}
