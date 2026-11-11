import { addEvent } from '../game';
import { BELT_ID, findBody } from '../generation/solar-system';
import { blockers, warships } from '../space/places';
import type { GameState } from '../state';

export function placeName(state: GameState, id: string): string {
  return id === BELT_ID ? 'dem Asteroidenring' : (findBody(state.system, id)?.name ?? id);
}

/** War ships arrive at their goal (timestamps, so it also works while the game is closed). */
export function fleetSystem(state: GameState): void {
  const arrived = new Set<string>();
  for (const ship of warships(state)) {
    const o = ship.orbit;
    if (!o?.to || o.arriveAt > state.time) continue;
    o.at = o.to;
    delete o.to;
    if (ship.owner === 'player') arrived.add(o.at);
  }
  for (const place of arrived) {
    const fight = blockers(state, 'player', place).length > 0;
    const where = placeName(state, place);
    if (fight) addEvent(state, `Raumschlacht bei ${where}!`, 'bad');
    else addEvent(state, `Eure Flotte ist bei ${where} angekommen.`, 'info');
  }
}
