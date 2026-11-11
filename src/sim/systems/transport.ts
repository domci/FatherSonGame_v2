import { addEvent } from '../game';
import type { Entity } from '../entity';
import { nameOfUnit } from '../names';
import { findBody } from '../generation/solar-system';
import type { GameState } from '../state';
import { landingSpot, unloadShip } from '../transport';
import { isBlocked, runBlockade } from '../space/blockade';

export interface FlightOptions {
  /** The game is closed right now (catch-up). */
  offline: boolean;
}

/** Enemy ships wait in orbit while the player is away (unless offline attacks are on). */
function mustWait(state: GameState, ship: Entity, zone: string, opts: FlightOptions): boolean {
  if (!opts.offline || state.settings.offlineAttacks || ship.owner === 'player') return false;
  return zone === state.players.player?.homeBodyId;
}

function land(state: GameState, ship: Entity, zone: string): void {
  if (!ship.ship) return;
  const home = ship.owner ? state.players[ship.owner]?.homeBodyId : undefined;
  ship.zone = zone;
  ship.position = landingSpot(state, ship, zone);
  ship.ship.phase = zone === home ? 'docked' : 'landed';
  ship.ship.phaseStartAt = state.time;
  const count = unloadShip(state, ship);
  if (ship.owner === 'player') {
    const where = findBody(state.system, zone)?.name ?? zone;
    addEvent(
      state,
      `${nameOfUnit(state, ship.owner, 'transport')} ist auf ${where} gelandet.`,
      'info',
    );
  } else if (zone === state.players.player?.homeBodyId && count > 0) {
    addEvent(state, 'Alarm! Feindliche Truppen sind gelandet!', 'bad');
  }
}

/** Transport ships fly between planets (timestamps, so it also works offline). */
export function transportSystem(state: GameState, opts: FlightOptions): void {
  for (const ship of [...state.world.with('ship', 'unit')]) {
    if (ship.unit.type !== 'transport' || ship.ship.phase !== 'outbound') continue;
    const zone = ship.ship.targetBodyId;
    if (!zone || ship.ship.phaseEndsAt > state.time) continue;
    if (mustWait(state, ship, zone, opts)) continue;
    if (isBlocked(state, ship, zone, opts) && !runBlockade(state, ship, zone)) {
      if (ship.owner === 'player')
        addEvent(state, 'Blockade! Euer Transportschiff wurde abgeschossen.', 'bad');
      continue;
    }
    land(state, ship, zone);
  }
}
