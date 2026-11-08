import { RESOURCE_IDS, RESOURCE_INFO, type ResourceAmounts } from '../content/resources';
import { formatNumber } from './dom';

/** "🪨 60  💧 10" */
export function costText(cost: ResourceAmounts): string {
  const parts = RESOURCE_IDS.filter((id) => cost[id]).map(
    (id) => `${RESOURCE_INFO[id].icon} ${formatNumber(cost[id] ?? 0)}`,
  );
  return parts.length ? parts.join('  ') : 'kostenlos';
}
