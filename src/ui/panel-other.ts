import { RESOURCE_INFO } from '../content/resources';
import { UNITS } from '../content/units';
import type { Session } from '../app/session';
import type { Entity } from '../sim/entity';
import { BELT_ID, findBody } from '../sim/generation/solar-system';
import { el } from './dom';
import { timer } from './panel-building';

const PHASE_TEXT = {
  docked: 'Im Hafen',
  outbound: 'Fliegt hin',
  mining: 'Baut ab',
  returning: 'Fliegt zurück',
} as const;

function targetName(session: Session, id: string | undefined): string {
  if (!id) return '';
  return id === BELT_ID ? 'Asteroidenring' : (findBody(session.state.system, id)?.name ?? id);
}

function shipRows(session: Session, e: Entity): HTMLElement[] {
  const ship = e.ship;
  if (!ship) return [];
  const rows: HTMLElement[] = [
    el('p', {}, `${PHASE_TEXT[ship.phase]} ${targetName(session, ship.targetBodyId)}`),
  ];
  if (ship.phase !== 'docked') {
    rows.push(el('p', {}, 'Nächster Schritt: ', timer(ship.phaseEndsAt)));
    if (ship.repeat) {
      rows.push(
        el(
          'button',
          {
            class: 'action',
            onclick: () => session.command({ type: 'recallShip', player: 'player', shipId: e.id }),
          },
          '↩ Nach dieser Runde zurück',
        ),
      );
    }
  } else {
    rows.push(el('p', { class: 'muted' }, 'Geht in die System-Ansicht ☀️ und wählt ein Ziel.'));
  }
  return rows;
}

export function unitPanel(session: Session, e: Entity): HTMLElement[] {
  if (!e.unit) return [];
  const def = UNITS[e.unit.type];
  const out = [el('h3', {}, e.owner === 'wild' ? `🕷 ${def.name}` : def.name)];
  if (e.health) out.push(el('p', {}, `❤ ${Math.ceil(e.health.hp)} / ${e.health.max}`));
  if (e.busyWith) out.push(el('p', { class: 'busy' }, '🛠 Baut gerade'));
  if (e.unit.type === 'hunter' && e.owner === 'player')
    out.push(
      el(
        'p',
        { class: 'muted' },
        'Tippt auf den Boden zum Laufen, auf eine Spinne oder ein Ei zum Jagen.',
      ),
    );
  return [...out, ...shipRows(session, e)];
}

export function wildPanel(e: Entity): HTMLElement[] {
  if (e.egg)
    return [
      el('h3', {}, '🥚 Spinnen-Ei'),
      el('p', { class: 'muted' }, 'Jäger können es einsammeln: Nahrung!'),
    ];
  if (e.nest)
    return [
      el('h3', {}, '🕸 Spinnen-Nest'),
      el('p', { class: 'muted' }, 'Hier wohnen Spinnenwesen. Kommt ihr zu nah, greifen sie an.'),
    ];
  return [];
}

export function bodyPanel(session: Session, bodyId: string): HTMLElement[] {
  const s = session.state;
  const body = bodyId === BELT_ID ? undefined : findBody(s.system, bodyId);
  const name = body?.name ?? 'Asteroidenring';
  const kinds = { rocky: 'Gesteinsplanet', gas: 'Gasplanet', ice: 'Eisplanet' } as const;
  const mineable = body?.mineable ?? s.system.belt.mineable;
  const out: HTMLElement[] = [
    el('h3', {}, name),
    el('p', {}, body ? kinds[body.kind] : 'Viele Felsbrocken voller Metall'),
  ];
  out.push(
    el(
      'p',
      {},
      `Rohstoffe: ${mineable.map((r) => RESOURCE_INFO[r].icon + ' ' + RESOURCE_INFO[r].name).join(', ')}`,
    ),
  );
  if (body)
    out.push(el('p', { class: 'muted' }, `Sonnenlicht: ${Math.round(body.solarFactor * 100)} %`));
  if (bodyId === s.system.homeBodyId)
    return [...out, el('p', { class: 'good' }, '🏠 Euer Heimatplanet')];
  return [...out, ...shipButtons(session, bodyId)];
}

function shipButtons(session: Session, bodyId: string): HTMLElement[] {
  const out: HTMLElement[] = [];
  const docked = session.state.world
    .with('ship')
    .entities.filter((e) => e.owner === 'player' && e.ship.phase === 'docked');
  if (docked.length === 0)
    out.push(el('p', { class: 'muted' }, 'Kein freies Mining-Schiff. Baut eins im Raumhafen.'));
  for (const ship of docked) {
    out.push(
      el(
        'button',
        {
          class: 'action',
          onclick: () =>
            session.command({
              type: 'sendShip',
              player: 'player',
              shipId: ship.id,
              targetId: bodyId,
            }),
        },
        `🚀 Mining-Schiff #${ship.id} hierher schicken`,
      ),
    );
  }
  return out;
}
