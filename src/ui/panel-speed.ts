import { viewerOf } from '../sim/viewer';
import type { Session } from '../app/session';
import type { Entity } from '../sim/entity';
import { entityTimer, researchTimer, speedUpPrice } from '../sim/speed-up';
import { action } from './panel-kit';

function button(
  session: Session,
  price: number,
  target: { entityId?: number; research?: boolean },
) {
  return action('sparkles', 'Sofort fertig machen', {
    cost: { crystals: price },
    have: session.state.players[viewerOf(session.state)]?.resources,
    title: 'Mit Wissenskristallen aus dem Quiz sofort fertig machen',
    onclick: () => session.command({ type: 'speedUp', player: session.me, ...target }),
  });
}

function priceOf(timer: { finishAt: number } | undefined, now: number): number {
  return timer && timer.finishAt > now ? speedUpPrice(timer.finishAt - now) : 0;
}

/** "Finish now" for a building that is built, upgraded or trains a unit. */
export function speedEntityButton(session: Session, e: Entity): HTMLElement | null {
  const price = priceOf(entityTimer(e), session.state.time);
  return price ? button(session, price, { entityId: e.id }) : null;
}

/** "Finish now" for the running research. */
export function speedResearchButton(session: Session): HTMLElement | null {
  const player = session.state.players[viewerOf(session.state)];
  const price = player ? priceOf(researchTimer(player), session.state.time) : 0;
  return price ? button(session, price, { research: true }) : null;
}

/** Part of the panel key: the prices change while time runs. */
export function speedKey(session: Session, e: Entity): string {
  const player = session.state.players[viewerOf(session.state)];
  const now = session.state.time;
  const research = player ? priceOf(researchTimer(player), now) : 0;
  return `${priceOf(entityTimer(e), now)}:${research}:${player?.resources.crystals ?? 0}`;
}
