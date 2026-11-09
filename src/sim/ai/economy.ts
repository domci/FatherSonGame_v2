import { AI_PLAN, type AiStep } from '../../content/ai';
import { BUILDINGS, buildingLevel, type BuildingId } from '../../content/buildings';
import { RESEARCH, type ResearchId } from '../../content/research';
import { UNITS, type UnitId } from '../../content/units';
import type { ResourceAmounts, ResourceId } from '../../content/resources';
import { applyCommand, type Command } from '../commands';
import type { PlayerId } from '../entity';
import { hasResearch } from '../research-helpers';
import { activeBuildings, playerStats } from '../stats';
import type { GameState, PlayerState } from '../state';
import { canAfford, missing } from '../wallet';
import { findBuildSpot } from './placement';
import { buildingsOf, trainerFor, unitCount, unitsOf } from './queries';

/** done = nothing to do, skip = cannot do it now, wait = save up for it. */
type Outcome = 'done' | 'skip' | 'wait' | 'acted';

/** Resources that come in by themselves (buildings or mining ships). */
function income(state: GameState, owner: PlayerId): Set<ResourceId> {
  const out = new Set<ResourceId>();
  for (const b of activeBuildings(state, owner)) {
    if (!b.building) continue;
    const lvl = buildingLevel(BUILDINGS[b.building.type], b.building.level);
    for (const id of Object.keys(lvl.produces ?? {}) as ResourceId[]) out.add(id);
  }
  if (unitsOf(state, owner, 'miningShip').length)
    ['metal', 'regolith'].forEach((r) => out.add(r as ResourceId));
  return out;
}

/** ok = can pay now, wait = save up, skip = this will never come in (no income). */
function payable(
  state: GameState,
  player: PlayerState,
  cost: ResourceAmounts,
): 'ok' | 'wait' | 'skip' {
  if (canAfford(player, cost)) return 'ok';
  const coming = income(state, player.id);
  return missing(player, cost).every((id) => coming.has(id)) ? 'wait' : 'skip';
}

function run(state: GameState, cmd: Command): Outcome {
  return applyCommand(state, cmd).ok ? 'acted' : 'skip';
}

function build(state: GameState, player: PlayerState, type: BuildingId): Outcome {
  const def = BUILDINGS[type];
  if (def.requires && !hasResearch(state, player.id, def.requires)) return 'skip';
  if (playerStats(state, player.id).freeDrones === 0) return 'wait';
  const pay = payable(state, player, buildingLevel(def, 1).cost);
  if (pay !== 'ok') return pay;
  const zone = player.homeBodyId;
  const spot = findBuildSpot(state, player.id, zone, type);
  if (!spot) return 'skip';
  return run(state, { type: 'build', player: player.id, zone, building: type, ...spot });
}

function upgrade(state: GameState, player: PlayerState, type: BuildingId, level: number): Outcome {
  const list = buildingsOf(state, player.id, type).filter((b) => (b.building?.level ?? 0) < level);
  if (list.length === 0) return buildingsOf(state, player.id, type).length ? 'done' : 'skip';
  const target = list.find((b) => !b.construction && (b.building?.level ?? 0) >= 1);
  if (!target?.building) return 'skip';
  if (playerStats(state, player.id).freeDrones === 0) return 'wait';
  const pay = payable(
    state,
    player,
    buildingLevel(BUILDINGS[type], target.building.level + 1).cost,
  );
  if (pay !== 'ok') return pay;
  return run(state, { type: 'upgrade', player: player.id, entityId: target.id });
}

function research(state: GameState, player: PlayerState, step: { research: ResearchId }): Outcome {
  const def = RESEARCH[step.research];
  if (player.research.done.includes(def.id) || player.research.current?.id === def.id)
    return 'done';
  if (player.research.current) return 'skip';
  const pay = payable(state, player, def.cost);
  if (pay !== 'ok') return pay;
  return run(state, { type: 'research', player: player.id, research: def.id });
}

export function trainUnit(state: GameState, player: PlayerState, unit: UnitId): Outcome {
  const trainer = trainerFor(state, player.id, unit);
  if (!trainer) return 'skip';
  const stats = playerStats(state, player.id);
  if (stats.housingUsed + UNITS[unit].housing > stats.housing) return 'skip';
  const pay = payable(state, player, UNITS[unit].cost);
  if (pay !== 'ok') return pay;
  return run(state, { type: 'train', player: player.id, buildingId: trainer.id, unit });
}

function doStep(state: GameState, player: PlayerState, step: AiStep): Outcome {
  if ('build' in step) {
    const have = buildingsOf(state, player.id, step.build).length;
    return have >= step.count ? 'done' : build(state, player, step.build);
  }
  if ('train' in step) {
    const have = unitCount(state, player.id, step.train);
    return have >= step.count ? 'done' : trainUnit(state, player, step.train);
  }
  if ('upgrade' in step) return upgrade(state, player, step.upgrade, step.level);
  return research(state, player, step);
}

/** Emergency needs come before the plan: energy, housing, storage. */
function urgentStep(state: GameState, owner: PlayerId): AiStep | null {
  const stats = playerStats(state, owner);
  const building = (t: BuildingId): number =>
    buildingsOf(state, owner, t).filter((b) => b.construction).length;
  if (stats.energyMade - stats.energyUsed < 3 && building('solarField') === 0)
    return { build: 'solarField', count: buildingsOf(state, owner, 'solarField').length + 1 };
  if (stats.housing - stats.housingUsed < 2 && building('habitatDome') === 0)
    return { build: 'habitatDome', count: buildingsOf(state, owner, 'habitatDome').length + 1 };
  const player = state.players[owner];
  const full = Object.values(player?.resources ?? {}).some((v) => v >= stats.storage * 0.9);
  if (full && building('storage') === 0 && buildingsOf(state, owner, 'storage').length < 3)
    return { build: 'storage', count: buildingsOf(state, owner, 'storage').length + 1 };
  return null;
}

/**
 * Works through the build plan. Stops when it has to save up for something.
 * `holdBack` = the computer is ahead of its enemy: only urgent needs, no new plan steps.
 */
export function runEconomy(
  state: GameState,
  owner: PlayerId,
  maxActions = 2,
  holdBack = false,
): void {
  const player = state.players[owner];
  if (!player) return;
  const urgent = urgentStep(state, owner);
  const plan = holdBack ? [] : AI_PLAN;
  const steps = urgent ? [urgent, ...plan] : plan;
  let actions = 0;
  for (const step of steps) {
    const outcome = doStep(state, player, step);
    if (outcome === 'wait') return;
    if (outcome === 'acted' && ++actions >= maxActions) return;
  }
}
