import { viewerHome, viewerOf } from '../sim/viewer';
import { UNITS } from '../content/units';
import type { Session } from '../app/session';
import type { Entity } from '../sim/entity';
import { findBody } from '../sim/generation/solar-system';
import { hostileSides } from '../sim/relations';
import { passengers } from '../sim/transport';
import { action, progress, stat, text } from './panel-kit';
import { t } from '../i18n';

function planetName(session: Session, id: string | undefined): string {
  return (id && findBody(session.state.system, id)?.name) || t('planet');
}

function used(session: Session, ship: Entity): number {
  return passengers(session.state, ship.id).reduce(
    (s, u) => s + (u.unit ? UNITS[u.unit.type].housing : 0),
    0,
  );
}

/** Where the transport can fly from where it is now. */
function flyButtons(session: Session, ship: Entity, loaded: boolean): HTMLElement[] {
  const s = session.state;
  const fly = (targetId: string): void =>
    void session.command({ type: 'fly', player: session.me, shipId: ship.id, targetId });
  if (ship.zone !== viewerHome(s))
    return [action('plane-takeoff', t('flyHome'), { onclick: () => fly(viewerHome(s)) })];
  return hostileSides(s, viewerOf(s)).map((id) => {
    const home = s.players[id]?.homeBodyId ?? '';
    const who = s.players[id]?.name ?? t('enemy');
    return action('plane-takeoff', t('attackFly', { p: planetName(session, home) }), {
      disabled: !loaded,
      title: loaded ? t('landAt', { n: who }) : t('boardFirst'),
      onclick: () => fly(home),
    });
  });
}

/** Passengers, unload and fly buttons of a transport ship. */
export function transportRows(session: Session, ship: Entity): HTMLElement[] {
  if (!ship.ship || ship.owner !== session.me) return [];
  const load = used(session, ship);
  const rows = [stat('users', t('aboard'), `${load} / ${UNITS.transport.carries ?? 0}`, '#c9d4e3')];
  const phase = ship.ship.phase;
  if (phase !== 'docked' && phase !== 'landed') {
    const label = t('flyingTo', { p: planetName(session, ship.ship.targetBodyId) });
    return [...rows, progress(label, ship.ship.phaseStartAt, ship.ship.phaseEndsAt)];
  }
  if (load > 0)
    rows.push(
      action('plane-landing', t('unloadAll'), {
        onclick: () =>
          void session.command({ type: 'unload', player: session.me, shipId: ship.id }),
      }),
    );
  rows.push(...flyButtons(session, ship, load > 0));
  rows.push(text(t('boardHelp'), 'p-text muted'));
  return rows;
}

/** Buttons in the multi-select panel: put the selected troops into a ship nearby. */
export function boardButtons(session: Session, unitIds: number[]): HTMLElement[] {
  const s = session.state;
  const ships = s.world
    .with('ship', 'unit')
    .entities.filter(
      (e) =>
        e.owner === session.me &&
        e.unit.type === 'transport' &&
        e.zone === session.ui.zone &&
        (e.ship.phase === 'docked' || e.ship.phase === 'landed'),
    );
  return ships.map((ship) =>
    action('log-in', t('boardShip', { n: ship.id }), {
      onclick: () =>
        void session.command({ type: 'board', player: session.me, shipId: ship.id, unitIds }),
    }),
  );
}
