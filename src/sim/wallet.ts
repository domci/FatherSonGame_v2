import { RESOURCE_IDS, type ResourceAmounts, type ResourceId } from '../content/resources';
import type { PlayerState } from './state';

export function amount(player: PlayerState, id: ResourceId): number {
  return player.resources[id] ?? 0;
}

export function canAfford(player: PlayerState, cost: ResourceAmounts): boolean {
  return RESOURCE_IDS.every((id) => amount(player, id) >= (cost[id] ?? 0));
}

/** Names of the resources that are missing (for messages). */
export function missing(player: PlayerState, cost: ResourceAmounts): ResourceId[] {
  return RESOURCE_IDS.filter((id) => amount(player, id) < (cost[id] ?? 0));
}

export function pay(player: PlayerState, cost: ResourceAmounts): boolean {
  if (!canAfford(player, cost)) return false;
  for (const id of RESOURCE_IDS) {
    const c = cost[id];
    if (c) player.resources[id] = amount(player, id) - c;
  }
  return true;
}

/** Adds resources but never above the storage limit. Returns what was really added. */
export function addResources(
  player: PlayerState,
  gain: ResourceAmounts,
  cap: number,
): ResourceAmounts {
  const added: ResourceAmounts = {};
  for (const id of RESOURCE_IDS) {
    const g = gain[id];
    if (!g) continue;
    const before = amount(player, id);
    const after = Math.min(cap, before + g);
    player.resources[id] = Math.max(before, after);
    added[id] = player.resources[id] - before;
  }
  return added;
}

export function scaleAmounts(a: ResourceAmounts, factor: number): ResourceAmounts {
  const out: ResourceAmounts = {};
  for (const id of RESOURCE_IDS) {
    const v = a[id];
    if (v) out[id] = v * factor;
  }
  return out;
}
