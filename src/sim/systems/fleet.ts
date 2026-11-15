import { addEvent } from '../game';
import type { SideId } from '../entity';
import { isHuman } from '../humans';
import { BELT_ID, findBody } from '../generation/solar-system';
import { blockers, warships } from '../space/places';
import type { GameState } from '../state';
import { L, fmt, same, type Loc } from '../../content/text';

export function placeName(state: GameState, id: string): Loc {
  if (id === BELT_ID) return L('dem Asteroidenring', 'the asteroid belt');
  return same(findBody(state.system, id)?.name ?? id);
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
    if (fight)
      addEvent(
        state,
        fmt(L('Raumschlacht bei {w}!', 'Space battle at {w}!'), { w: where }),
        'bad',
        owner,
      );
    else
      addEvent(
        state,
        fmt(L('Eure Flotte ist bei {w} angekommen.', 'Your fleet has arrived at {w}.'), {
          w: where,
        }),
        'info',
        owner,
      );
  }
}
