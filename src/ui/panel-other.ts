import { RESOURCE_INFO } from '../content/resources';
import { UNITS } from '../content/units';
import type { Session } from '../app/session';
import type { Entity } from '../sim/entity';
import { BELT_ID, findBody } from '../sim/generation/solar-system';
import { canViewSurface } from '../sim/visibility';
import { el } from './dom';
import { resourceIcon } from './icons';
import { action, header, progress, section, stat, text } from './panel-kit';
import { nameOfUnit } from '../sim/names';
import { transportRows } from './panel-transport';
import { fleetRows } from './panel-fleet';

const PHASE_TEXT = {
  docked: 'Im Hafen',
  outbound: 'Fliegt hin',
  mining: 'Baut ab',
  returning: 'Fliegt zurück',
  landed: 'Gelandet',
} as const;

function targetName(session: Session, id: string | undefined): string {
  if (!id) return '';
  return id === BELT_ID ? 'Asteroidenring' : (findBody(session.state.system, id)?.name ?? id);
}

function shipRows(session: Session, e: Entity): HTMLElement[] {
  const ship = e.ship;
  if (!ship) return [];
  if (e.unit?.type === 'transport') return transportRows(session, e);
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

const HINTS: Partial<Record<keyof typeof UNITS, string>> = {
  hunter: 'Tippt auf den Boden zum Laufen, auf eine Spinne oder ein Ei zum Jagen.',
  infantry:
    'Tippt auf den Boden: Die Truppe läuft hin und kämpft unterwegs. Tippt auf einen Feind: Angriff!',
  tank: 'Stark gegen Gebäude. Tippt auf einen Feind: Angriff!',
  flakTank: 'Schießt nur auf Flugzeuge. Gegen Bodentruppen hilft er nicht.',
  fighter: 'Fliegt über Mauern und trifft alles. Verbraucht Gas, solange es fliegt oder kämpft.',
  bomber: 'Wirft Bomben auf Gebäude und Bodentruppen. Verbraucht Gas. Flak ist gefährlich!',
};

function ownerLabel(e: Entity): string {
  if (e.owner === 'wild') return 'Wildes Tier';
  return e.owner === 'player' ? 'Einheit' : 'Feind';
}

export function unitPanel(session: Session, e: Entity): HTMLElement[] {
  if (!e.unit) return [];
  const def = UNITS[e.unit.type];
  const out = [header(nameOfUnit(session.state, e.owner, def.id), ownerLabel(e))];
  if (e.health)
    out.push(stat('heart', 'Leben', `${Math.ceil(e.health.hp)} / ${e.health.max}`, '#ff6b81'));
  if (e.attacker) out.push(stat('crosshair', 'Schaden', String(e.attacker.damage), '#ffb35a'));
  if (def.armor) out.push(stat('shield', 'Panzerung', String(def.armor), '#9fb4cc'));
  if (e.busyWith) out.push(stat('hammer', 'Status', 'Baut gerade', '#ffd25a'));
  const hint = HINTS[def.id];
  if (hint && e.owner === 'player') out.push(text(hint, 'p-text muted'));
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
  out.push(...lookButton(session, bodyId), ...fleetRows(session, bodyId));
  if (bodyId === s.system.homeBodyId) return [...out, text('Euer Heimatplanet', 'p-text good')];
  if (bodyId === s.players.ai?.homeBodyId)
    out.push(text('Hier lebt der Feind!', 'p-text bad'), ...transportButtons(session, bodyId));
  return [...out, ...shipButtons(session, bodyId)];
}

/** "Look at the surface": home, a planet with own troops, or the enemy home with the radar. */
function lookButton(session: Session, bodyId: string): HTMLElement[] {
  const s = session.state;
  if (canViewSurface(s, 'player', bodyId))
    return [action('eye', 'Oberfläche ansehen', { onclick: () => session.goZone(bodyId) })];
  if (bodyId === s.players.ai?.homeBodyId)
    return [
      text('Die feindliche Basis seht ihr erst mit dem Fernradar (Forschung).', 'p-text muted'),
    ];
  return [];
}

function transportButtons(session: Session, bodyId: string): HTMLElement[] {
  const ready = session.state.world
    .with('ship', 'unit')
    .entities.filter(
      (e) => e.owner === 'player' && e.unit.type === 'transport' && e.ship.phase === 'docked',
    );
  return ready.map((ship) =>
    action('plane-takeoff', `Transportschiff #${ship.id} hinschicken`, {
      onclick: () =>
        session.command({ type: 'fly', player: 'player', shipId: ship.id, targetId: bodyId }),
    }),
  );
}

function shipButtons(session: Session, bodyId: string): HTMLElement[] {
  const docked = session.state.world
    .with('ship', 'unit')
    .entities.filter(
      (e) => e.owner === 'player' && e.unit.type === 'miningShip' && e.ship.phase === 'docked',
    );
  if (docked.length === 0)
    return [text('Kein freies Mining-Schiff. Baut eins im Raumhafen.', 'p-text muted')];
  return docked.map((ship) =>
    action('rocket', `Mining-Schiff #${ship.id} hierher schicken`, {
      onclick: () =>
        session.command({ type: 'sendShip', player: 'player', shipId: ship.id, targetId: bodyId }),
    }),
  );
}
