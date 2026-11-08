import { RESOURCE_INFO } from '../content/resources';
import { UNITS } from '../content/units';
import type { Session } from '../app/session';
import type { Entity } from '../sim/entity';
import { BELT_ID, findBody } from '../sim/generation/solar-system';
import { el } from './dom';
import { resourceIcon } from './icons';
import { action, header, progress, section, stat, text } from './panel-kit';

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
  const label = `${PHASE_TEXT[ship.phase]} ${targetName(session, ship.targetBodyId)}`;
  if (ship.phase === 'docked')
    return [text(label), text('Öffnet die System-Ansicht und wählt ein Ziel.', 'p-text muted')];
  const rows = [progress(label, ship.phaseStartAt, ship.phaseEndsAt)];
  if (ship.repeat)
    rows.push(
      action('log-out', 'Nach dieser Runde zurück', {
        onclick: () => session.command({ type: 'recallShip', player: 'player', shipId: e.id }),
      }),
    );
  return rows;
}

export function unitPanel(session: Session, e: Entity): HTMLElement[] {
  if (!e.unit) return [];
  const def = UNITS[e.unit.type];
  const wild = e.owner === 'wild';
  const out = [header(def.name, wild ? 'Wildes Tier' : 'Einheit')];
  if (e.health)
    out.push(stat('heart', 'Leben', `${Math.ceil(e.health.hp)} / ${e.health.max}`, '#ff6b81'));
  if (e.attacker) out.push(stat('crosshair', 'Schaden', String(e.attacker.damage), '#ffb35a'));
  if (e.busyWith) out.push(stat('hammer', 'Status', 'Baut gerade', '#ffd25a'));
  if (e.unit.type === 'hunter' && !wild)
    out.push(
      text(
        'Tippt auf den Boden zum Laufen, auf eine Spinne oder ein Ei zum Jagen.',
        'p-text muted',
      ),
    );
  return [...out, ...shipRows(session, e)];
}

export function wildPanel(e: Entity): HTMLElement[] {
  if (e.egg)
    return [
      header('Spinnen-Ei', 'Wildnis'),
      text('Jäger können es einsammeln: Nahrung!', 'p-text muted'),
    ];
  if (e.nest)
    return [
      header('Spinnen-Nest', 'Wildnis'),
      text('Hier wohnen Spinnenwesen. Kommt ihr zu nah, greifen sie an.', 'p-text muted'),
    ];
  return [];
}

export function bodyPanel(session: Session, bodyId: string): HTMLElement[] {
  const s = session.state;
  const body = bodyId === BELT_ID ? undefined : findBody(s.system, bodyId);
  const kinds = { rocky: 'Gesteinsplanet', gas: 'Gasplanet', ice: 'Eisplanet' } as const;
  const mineable = body?.mineable ?? s.system.belt.mineable;
  const out: HTMLElement[] = [
    header(body?.name ?? 'Asteroidenring', body ? kinds[body.kind] : 'Felsbrocken voller Metall'),
    section(
      'Rohstoffe',
      el(
        'div',
        { class: 'tags' },
        ...mineable.map((r) =>
          el('span', { class: 'tag' }, resourceIcon(r), RESOURCE_INFO[r].name),
        ),
      ),
    ),
  ];
  if (body)
    out.push(stat('sun', 'Sonnenlicht', `${Math.round(body.solarFactor * 100)} %`, '#ffd25a'));
  if (bodyId === s.system.homeBodyId) return [...out, text('Euer Heimatplanet', 'p-text good')];
  return [...out, ...shipButtons(session, bodyId)];
}

function shipButtons(session: Session, bodyId: string): HTMLElement[] {
  const docked = session.state.world
    .with('ship')
    .entities.filter((e) => e.owner === 'player' && e.ship.phase === 'docked');
  if (docked.length === 0)
    return [text('Kein freies Mining-Schiff. Baut eins im Raumhafen.', 'p-text muted')];
  return docked.map((ship) =>
    action('rocket', `Mining-Schiff #${ship.id} hierher schicken`, {
      onclick: () =>
        session.command({ type: 'sendShip', player: 'player', shipId: ship.id, targetId: bodyId }),
    }),
  );
}
