import type { AiStep } from '../../content/ai';
import type { BuildingId } from '../../content/buildings';
import { GROW_MOOD } from '../../content/colony';
import { healthy } from '../colony';
import type { PlayerId } from '../entity';
import type { PlayerStats } from '../stats';
import type { GameState } from '../state';
import { amount } from '../wallet';
import { findBuildSpot } from './placement';
import { buildingsOf } from './queries';

/**
 * A need is short when it ran out, or when only a few minutes are left and nothing makes it.
 */
function short(state: GameState, owner: PlayerId, need: 'oxygen' | 'water' | 'food'): boolean {
  const player = state.players[owner];
  if (!player) return false;
  if (player.colony.met[need] < 1) return true;
  const maker = need === 'food' ? 'greenhouse' : 'waterOxygenPlant';
  const made = buildingsOf(state, owner, maker).some((b) => (b.building?.level ?? 0) >= 1);
  return !made && amount(player, need) < player.colony.people * 3;
}

function more(state: GameState, owner: PlayerId, type: BuildingId): AiStep {
  return { build: type, count: buildingsOf(state, owner, type).length + 1 };
}

/** One level more for the lowest building of this type. */
function higher(state: GameState, owner: PlayerId, type: BuildingId): AiStep {
  const levels = buildingsOf(state, owner, type).map((b) => b.building?.level ?? 0);
  return { upgrade: type, level: Math.min(3, Math.min(...levels, 2) + 1) };
}

/** A new building of this type, or a bigger one when there is no place for a new one. */
function moreOrHigher(state: GameState, owner: PlayerId, type: BuildingId): AiStep {
  const zone = state.players[owner]?.homeBodyId ?? '';
  return findBuildSpot(state, owner, zone, type)
    ? more(state, owner, type)
    : higher(state, owner, type);
}

/** Air and water: a pump for each plant, then plants. */
function airAndWater(state: GameState, owner: PlayerId): AiStep[] {
  const pumps = buildingsOf(state, owner, 'pinkPump').length;
  const plants = buildingsOf(state, owner, 'waterOxygenPlant').length;
  return [moreOrHigher(state, owner, pumps > plants ? 'waterOxygenPlant' : 'pinkPump')];
}

function busy(state: GameState, owner: PlayerId, type: BuildingId): boolean {
  return buildingsOf(state, owner, type).some((b) => b.construction);
}

/** Air, water and food first. */
function needsSteps(state: GameState, owner: PlayerId): AiStep[] {
  const air = short(state, owner, 'oxygen') || short(state, owner, 'water');
  if (air && !busy(state, owner, 'waterOxygenPlant') && !busy(state, owner, 'pinkPump'))
    return airAndWater(state, owner);
  if (short(state, owner, 'food') && !busy(state, owner, 'greenhouse'))
    return [moreOrHigher(state, owner, 'greenhouse')];
  return [];
}

/**
 * What the people need most right now (before the build plan): air, water, food,
 * places to live and work, a medical station. `holdBack` = only air, water and food.
 */
export function colonySteps(
  state: GameState,
  owner: PlayerId,
  stats: PlayerStats,
  holdBack = false,
): AiStep[] {
  const c = state.players[owner]?.colony;
  if (!c) return [];
  const needs = needsSteps(state, owner);
  if (needs.length || holdBack) return needs;
  const room = stats.residents - c.people;
  const needRoom = room <= 1 && c.mood >= GROW_MOOD && healthy(c) < stats.jobs + 2;
  if (needRoom && !busy(state, owner, 'habitatDome')) return [more(state, owner, 'habitatDome')];
  if (c.sick > c.people * 0.25 && buildingsOf(state, owner, 'medbay').length === 0)
    return [more(state, owner, 'medbay')];
  return [];
}
