import type { ResourceAmounts } from '../../content/resources';
import { addEvent } from '../game';
import type { Entity, ShipData } from '../entity';
import { BELT_ID, bodyPosition, findBody } from '../generation/solar-system';
import { hasResearch } from '../research-helpers';
import { playerStats } from '../stats';
import type { GameState } from '../state';
import { addResources } from '../wallet';
import { SECOND } from '../clock';

export const MINING_MS = 60 * SECOND;
/** Flight time per map unit. */
const MS_PER_UNIT = 4 * SECOND;

function homeRadius(state: GameState, ship: Entity): number {
  const home = ship.owner ? state.players[ship.owner]?.homeBodyId : undefined;
  return (home && findBody(state.system, home)?.orbitRadius) || 0;
}

/** Flight time from home to the target, measured at launch time. */
export function travelMs(state: GameState, ship: Entity, targetId: string): number {
  const homeId = ship.owner ? state.players[ship.owner]?.homeBodyId : undefined;
  const home = homeId ? findBody(state.system, homeId) : undefined;
  if (!home) return 60 * SECOND;
  if (targetId === BELT_ID) {
    const mid = (state.system.belt.inner + state.system.belt.outer) / 2;
    return Math.round((Math.abs(homeRadius(state, ship) - mid) + 2) * MS_PER_UNIT);
  }
  const target = findBody(state.system, targetId);
  if (!target) return 60 * SECOND;
  const a = bodyPosition(home, state.time);
  const b = bodyPosition(target, state.time);
  return Math.round(Math.hypot(a.x - b.x, a.y - b.y) * MS_PER_UNIT);
}

/** What a full ship brings home from a target. */
export function cargoFor(state: GameState, targetId: string, capacity: number): ResourceAmounts {
  if (targetId === BELT_ID) return { metal: capacity * 0.8, regolith: capacity * 0.2 };
  const body = findBody(state.system, targetId);
  if (body?.kind === 'gas') return { gas: capacity };
  if (body?.kind === 'ice') return { water: capacity };
  return { regolith: capacity * 0.8, diamonds: capacity * 0.06 };
}

function setPhase(ship: ShipData, phase: ShipData['phase'], start: number, duration: number): void {
  ship.phase = phase;
  ship.phaseStartAt = start;
  ship.phaseEndsAt = start + duration;
}

export function launchShip(state: GameState, ship: Entity, targetId: string): void {
  if (!ship.ship) return;
  ship.ship.targetBodyId = targetId;
  ship.ship.repeat = true;
  ship.ship.capacity = hasResearch(state, ship.owner ?? 'wild', 'cargoBays') ? 150 : 100;
  setPhase(ship.ship, 'outbound', state.time, travelMs(state, ship, targetId));
}

function unload(state: GameState, ship: Entity, data: ShipData): void {
  const player = ship.owner ? state.players[ship.owner] : undefined;
  if (!player || !data.targetBodyId) return;
  addResources(
    player,
    cargoFor(state, data.targetBodyId, data.cargo),
    playerStats(state, player.id).storage,
  );
  data.cargo = 0;
}

function nextPhase(state: GameState, ship: Entity, data: ShipData): void {
  const end = data.phaseEndsAt;
  const target = data.targetBodyId ?? BELT_ID;
  if (data.phase === 'outbound') setPhase(data, 'mining', end, MINING_MS);
  else if (data.phase === 'mining') {
    data.cargo = data.capacity;
    setPhase(data, 'returning', end, travelMs(state, ship, target));
  } else if (data.phase === 'returning') {
    unload(state, ship, data);
    if (data.repeat) setPhase(data, 'outbound', end, travelMs(state, ship, target));
    else {
      setPhase(data, 'docked', end, 0);
      if (ship.owner === 'player') addEvent(state, 'Mining-Schiff ist zurück im Hafen.', 'info');
    }
  }
}

/** Ships fly, mine and bring cargo home. Uses timestamps, so it also works offline. */
export function miningSystem(state: GameState): void {
  for (const ship of state.world.with('ship')) {
    for (let guard = 0; guard < 1000; guard++) {
      const data = ship.ship;
      if (data.phase === 'docked' || data.phaseEndsAt > state.time) break;
      nextPhase(state, ship, data);
    }
  }
}
