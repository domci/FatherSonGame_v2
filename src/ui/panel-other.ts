import { viewerHome, viewerOf } from '../sim/viewer';
import { RESOURCE_INFO } from '../content/resources';
import { UNITS } from '../content/units';
import type { Session } from '../app/session';
import type { Entity, SideId } from '../sim/entity';
import { BELT_ID, findBody } from '../sim/generation/solar-system';
import { homeOwner, relationOf } from '../sim/relations';
import { ownerLabel, relationLabel } from './panel-peoples';
import { canViewSurface } from '../sim/visibility';
import { el } from './dom';
import { resourceIcon } from './icons';
import { action, header, progress, section, stat, text } from './panel-kit';
import { nameOfUnit } from '../sim/names';
import { transportRows } from './panel-transport';
import { fleetRows } from './panel-fleet';
import { t, tx } from '../i18n';

const PHASE_TEXT = {
  docked: t('phDocked'),
  outbound: t('phOutbound'),
  mining: t('phMining'),
  returning: t('phReturning'),
  landed: t('phLanded'),
} as const;

function targetName(session: Session, id: string | undefined): string {
  if (!id) return '';
  return id === BELT_ID ? t('belt') : (findBody(session.state.system, id)?.name ?? id);
}

function shipRows(session: Session, e: Entity): HTMLElement[] {
  const ship = e.ship;
  if (!ship) return [];
  if (e.unit?.type === 'transport') return transportRows(session, e);
  const label = `${PHASE_TEXT[ship.phase]} ${targetName(session, ship.targetBodyId)}`;
  if (ship.phase === 'docked') return [text(label), text(t('pickTarget'), 'p-text muted')];
  const rows = [progress(label, ship.phaseStartAt, ship.phaseEndsAt)];
  if (ship.repeat)
    rows.push(
      action('log-out', t('recall'), {
        onclick: () => session.command({ type: 'recallShip', player: session.me, shipId: e.id }),
      }),
    );
  return rows;
}

const HINTS: Partial<Record<keyof typeof UNITS, string>> = {
  hunter: t('hintHunter'),
  infantry: t('hintInfantry'),
  tank: t('hintTank'),
  flakTank: t('hintFlak'),
  fighter: t('hintFighter'),
  bomber: t('hintBomber'),
};

export function unitPanel(session: Session, e: Entity): HTMLElement[] {
  if (!e.unit) return [];
  const def = UNITS[e.unit.type];
  const out = [
    header(
      tx(nameOfUnit(session.state, e.owner, def.id)),
      ownerLabel(session.state, e.owner, t('unit')),
    ),
  ];
  if (e.health)
    out.push(stat('heart', 'Leben', `${Math.ceil(e.health.hp)} / ${e.health.max}`, '#ff6b81'));
  if (e.attacker) out.push(stat('crosshair', 'Schaden', String(e.attacker.damage), '#ffb35a'));
  if (def.armor) out.push(stat('shield', 'Panzerung', String(def.armor), '#9fb4cc'));
  if (e.busyWith) out.push(stat('hammer', t('status'), t('busyBuilding'), '#ffd25a'));
  const hint = HINTS[def.id];
  if (hint && e.owner === session.me) out.push(text(hint, 'p-text muted'));
  return [...out, ...shipRows(session, e)];
}

export function wildPanel(e: Entity): HTMLElement[] {
  if (e.egg) return [header(t('egg'), t('wild')), text(t('eggHelp'), 'p-text muted')];
  if (e.nest) return [header(t('nest'), t('wild')), text(t('nestHelp'), 'p-text muted')];
  return [];
}

export function bodyPanel(session: Session, bodyId: string): HTMLElement[] {
  const s = session.state;
  const body = bodyId === BELT_ID ? undefined : findBody(s.system, bodyId);
  const kinds = { rocky: t('kRocky'), gas: t('kGas'), ice: t('kIce') } as const;
  const mineable = body?.mineable ?? s.system.belt.mineable;
  const out: HTMLElement[] = [
    header(body?.name ?? t('belt'), body ? kinds[body.kind] : t('beltDesc')),
    section(
      t('resources'),
      el(
        'div',
        { class: 'tags' },
        ...mineable.map((r) =>
          el('span', { class: 'tag' }, resourceIcon(r), tx(RESOURCE_INFO[r].name)),
        ),
      ),
    ),
  ];
  if (body)
    out.push(stat('sun', t('sunlight'), `${Math.round(body.solarFactor * 100)} %`, '#ffd25a'));
  out.push(...lookButton(session, bodyId), ...fleetRows(session, bodyId));
  if (bodyId === viewerHome(s)) return [...out, text(t('homePlanet'), 'p-text good')];
  const owner = homeOwner(s, bodyId);
  if (owner) out.push(...homeRows(session, owner, bodyId));
  return [...out, ...shipButtons(session, bodyId)];
}

/** Who lives on this planet, how you stand, and the transport buttons against enemies. */
function homeRows(session: Session, owner: SideId, bodyId: string): HTMLElement[] {
  const s = session.state;
  const p = s.players[owner];
  if (!p) return [];
  const rel = relationLabel(s, owner);
  const line = stat('flag', p.name, rel.name, rel.color);
  if (p.defeated) return [line, text(t('defeatedPeople'), 'p-text muted')];
  const war = relationOf(s, viewerOf(s), owner) === 'war';
  return [
    line,
    text(war ? t('enemyHere') : t('noWar'), war ? 'p-text bad' : 'p-text muted'),
    ...(war ? transportButtons(session, bodyId) : []),
  ];
}

/** "Look at the surface": home, a planet with own troops, or a foreign home with the radar. */
function lookButton(session: Session, bodyId: string): HTMLElement[] {
  const s = session.state;
  if (canViewSurface(s, viewerOf(s), bodyId))
    return [action('eye', t('lookSurface'), { onclick: () => session.goZone(bodyId) })];
  if (homeOwner(s, bodyId)) return [text(t('needRadar'), 'p-text muted')];
  return [];
}

function transportButtons(session: Session, bodyId: string): HTMLElement[] {
  const ready = session.state.world
    .with('ship', 'unit')
    .entities.filter(
      (e) => e.owner === session.me && e.unit.type === 'transport' && e.ship.phase === 'docked',
    );
  return ready.map((ship) =>
    action('plane-takeoff', t('sendTransport', { n: ship.id }), {
      onclick: () =>
        session.command({ type: 'fly', player: session.me, shipId: ship.id, targetId: bodyId }),
    }),
  );
}

function shipButtons(session: Session, bodyId: string): HTMLElement[] {
  const docked = session.state.world
    .with('ship', 'unit')
    .entities.filter(
      (e) => e.owner === session.me && e.unit.type === 'miningShip' && e.ship.phase === 'docked',
    );
  if (docked.length === 0) return [text(t('noMiner'), 'p-text muted')];
  return docked.map((ship) =>
    action('rocket', t('sendMiner', { n: ship.id }), {
      onclick: () =>
        session.command({
          type: 'sendShip',
          player: session.me,
          shipId: ship.id,
          targetId: bodyId,
        }),
    }),
  );
}
