import { addEvent } from '../game';
import { isAway, isHuman, tell } from '../humans';
import type { Entity } from '../entity';
import { nameOfUnit } from '../names';
import { findBody } from '../generation/solar-system';
import type { GameState } from '../state';
import { landingSpot, unloadShip } from '../transport';
import { isBlocked, runBlockade } from '../space/blockade';
import { homeOwner, hostile } from '../relations';
import { L, fmt } from '../../content/text';

export interface FlightOptions {
  /** The game is closed right now (catch-up). */
  offline: boolean;
}

/** Computer ships wait in orbit while the person who lives there is away (unless offline attacks are on). */
function mustWait(state: GameState, ship: Entity, zone: string, opts: FlightOptions): boolean {
  const owner = homeOwner(state, zone);
  if (state.settings.offlineAttacks || !owner || isHuman(state, ship.owner)) return false;
  return isAway(state, owner, opts.offline) && hostile(state, owner, ship.owner);
}

function land(state: GameState, ship: Entity, zone: string): void {
  if (!ship.ship) return;
  const home = ship.owner ? state.players[ship.owner]?.homeBodyId : undefined;
  ship.zone = zone;
  ship.position = landingSpot(state, ship, zone);
  ship.ship.phase = zone === home ? 'docked' : 'landed';
  ship.ship.phaseStartAt = state.time;
  const count = unloadShip(state, ship);
  if (isHuman(state, ship.owner)) {
    const where = findBody(state.system, zone)?.name ?? zone;
    tell(
      state,
      ship.owner,
      fmt(L('{s} ist auf {w} gelandet.', '{s} has landed on {w}.'), {
        s: nameOfUnit(state, ship.owner, 'transport'),
        w: where,
      }),
      'info',
    );
  }
  const victim = homeOwner(state, zone);
  if (count > 0 && isHuman(state, victim) && hostile(state, victim, ship.owner))
    addEvent(
      state,
      L('Alarm! Feindliche Truppen sind gelandet!', 'Alarm! Enemy troops have landed!'),
      'bad',
      victim,
    );
}

/** Transport ships fly between planets (timestamps, so it also works offline). */
export function transportSystem(state: GameState, opts: FlightOptions): void {
  for (const ship of [...state.world.with('ship', 'unit')]) {
    if (ship.unit.type !== 'transport' || ship.ship.phase !== 'outbound') continue;
    const zone = ship.ship.targetBodyId;
    if (!zone || ship.ship.phaseEndsAt > state.time) continue;
    if (mustWait(state, ship, zone, opts)) continue;
    if (isBlocked(state, ship, zone, opts) && !runBlockade(state, ship, zone)) {
      tell(
        state,
        ship.owner,
        L(
          'Blockade! Euer Transportschiff wurde abgeschossen.',
          'Blockade! Your transport ship was shot down.',
        ),
        'bad',
      );
      continue;
    }
    land(state, ship, zone);
  }
}
