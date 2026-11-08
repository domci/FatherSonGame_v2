import { BUILDINGS, buildingLevel, type BuildingId } from '../../content/buildings';
import { RESOURCE_IDS, type ResourceAmounts } from '../../content/resources';
import type { ResearchId } from '../../content/research';
import type { PlayerId } from '../entity';
import { hasResearch } from '../research-helpers';
import { activeBuildings, playerStats } from '../stats';
import type { GameState, PlayerState } from '../state';
import { addResources, amount, scaleAmounts } from '../wallet';
import { MINUTE } from '../clock';

const BONUSES: { building: BuildingId; research: ResearchId; factor: number }[] = [
  { building: 'greenhouse', research: 'hydroponics', factor: 1.3 },
  { building: 'regolithExcavator', research: 'efficientMining', factor: 1.25 },
];

function bonus(state: GameState, owner: PlayerId, type: BuildingId): number {
  let f = 1;
  for (const b of BONUSES)
    if (b.building === type && hasResearch(state, owner, b.research)) f *= b.factor;
  return f;
}

/** 0..1: how much of the needed input is there. */
function inputFactor(player: PlayerState, needed: ResourceAmounts): number {
  let f = 1;
  for (const id of RESOURCE_IDS) {
    const n = needed[id];
    if (n) f = Math.min(f, amount(player, id) / n);
  }
  return Math.max(0, f);
}

function runPlayer(state: GameState, player: PlayerState, minutes: number): void {
  const stats = playerStats(state, player.id);
  for (const b of activeBuildings(state, player.id)) {
    if (!b.building) continue;
    const lvl = buildingLevel(BUILDINGS[b.building.type], b.building.level);
    if (!lvl.produces) continue;
    let factor = stats.efficiency * minutes;
    if (lvl.consumes) {
      const needed = scaleAmounts(lvl.consumes, factor);
      const f = inputFactor(player, needed);
      for (const id of RESOURCE_IDS) {
        const n = needed[id];
        if (n) player.resources[id] = amount(player, id) - n * f;
      }
      factor *= f;
    }
    const gain = scaleAmounts(lvl.produces, factor * bonus(state, player.id, b.building.type));
    addResources(player, gain, stats.storage);
  }
}

/** Buildings make resources. Rates are per minute; dtMs is the time step. */
export function productionSystem(state: GameState, dtMs: number): void {
  for (const player of Object.values(state.players)) {
    if (player) runPlayer(state, player, dtMs / MINUTE);
  }
}
