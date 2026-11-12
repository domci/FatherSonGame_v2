import { addEvent } from '../game';
import type { SideId } from '../entity';
import { isHuman } from '../humans';
import { BELT_ID, findBody } from '../generation/solar-system';
import { blockers, warships } from '../space/places';
import type { GameState } from '../state';

export function placeName(state: GameState, id: string): string {
  return id === BELT_ID ? 'dem Asteroidenring' : (findBody(state.system, id)?.name ?? id);
}

/** War ships arrive at their goal (timestamps, so it also works while the game is closed). */
export function fleetSystem(state: GameState): void {
  const arrived = new Map<string, SideId>();
  for (const ship of warships(state)) {
    const o = ship.orbit;
    if (!o?.to || o.arriveAt > state.time) continue;
    o.at = o.to;
    delete o.to;
    if (isHuman(state, ship.owner)) arrived.set(`${ship.owner}|${o.at}`, ship.owner);
  }
  for (const [key, owner] of arrived) {
    const place = key.slice(owner.length + 1);
    const fight = blockers(state, owner, place).length > 0;
    const where = placeName(state, place);
    if (fight) addEvent(state, `Raumschlacht bei ${where}!`, 'bad', owner);
    else addEvent(state, `Eure Flotte ist bei ${where} angekommen.`, 'info', owner);
  }
}
