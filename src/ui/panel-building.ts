import { viewerOf } from '../sim/viewer';
import {
  BUILDINGS,
  buildTimeSeconds,
  buildingLevel,
  type BuildingCategory,
} from '../content/buildings';
import { buildingDescription } from '../content/factions';
import { RESEARCH, RESEARCH_LIST } from '../content/research';
import { hasResearch } from '../sim/research-helpers';
import { stageSeconds } from '../content/time-curve';
import { UNITS, type UnitId } from '../content/units';
import type { Session } from '../app/session';
import type { Entity } from '../sim/entity';
import { factionOf, nameOfBuilding, nameOfUnit } from '../sim/names';
import { thumb } from './build-menu';
import { ownerLabel } from './panel-peoples';
import { hostile } from '../sim/relations';
import { colonyStats } from './panel-colony';
import { speedEntityButton, speedKey, speedResearchButton } from './panel-speed';
import { action, header, levelPips, progress, section, stat, text } from './panel-kit';
import { t, tx } from '../i18n';

export { timer } from './panel-kit';

const CATEGORY: Record<BuildingCategory, string> = {
  command: t('catCommand'),
  energy: t('catEnergy'),
  mining: t('catMining'),
  housing: t('catHousing'),
  processing: t('catProcessing'),
  food: t('catFood'),
  military: t('catMilitary'),
  research: t('catResearch'),
  space: t('catSpace'),
  defense: t('catDefense'),
};

function upgradeRow(session: Session, e: Entity): HTMLElement | null {
  if (!e.building || e.construction) return null;
  const def = BUILDINGS[e.building.type];
  const next = e.building.level + 1;
  if (next > def.levels.length) return text(t('maxLevel'), 'p-text muted');
  return action('arrow-up', t('upgradeTo', { n: next }), {
    cost: buildingLevel(def, next).cost,
    have: session.state.players[viewerOf(session.state)]?.resources,
    timeMs: buildTimeSeconds(def, next) * 1000,
    onclick: () => session.command({ type: 'upgrade', player: session.me, entityId: e.id }),
  });
}

function trainRows(session: Session, e: Entity): HTMLElement | null {
  const trains = e.building ? (BUILDINGS[e.building.type].trains ?? []) : [];
  if (!e.building || e.building.level < 1 || !trains.length) return null;
  const rows: (HTMLElement | null)[] = [];
  const name = (id: keyof typeof UNITS): string =>
    tx(nameOfUnit(session.state, viewerOf(session.state), id));
  if (e.training) {
    const u = UNITS[e.training.unit];
    const q = e.training.queue.length;
    const label = q ? t('inQueue', { u: name(u.id), n: q }) : name(u.id);
    rows.push(progress(label, e.training.finishAt - u.trainSeconds * 1000, e.training.finishAt));
    if (!e.construction) rows.push(speedEntityButton(session, e));
  }
  for (const unit of trains) rows.push(trainButton(session, e, unit, name(unit)));
  return section(t('units'), ...rows);
}

/** Train button. Locked (with the research name) when the unit needs research. */
function trainButton(session: Session, e: Entity, unit: UnitId, label: string): HTMLElement {
  const need = UNITS[unit].requires;
  const locked = !!need && !hasResearch(session.state, viewerOf(session.state), need);
  return action(locked ? 'lock' : 'plus', label, {
    cost: UNITS[unit].cost,
    have: session.state.players[viewerOf(session.state)]?.resources,
    timeMs: UNITS[unit].trainSeconds * 1000,
    disabled: locked,
    title: locked && need ? t('needsResearch', { r: tx(RESEARCH[need].name) }) : undefined,
    onclick: () => session.command({ type: 'train', player: session.me, buildingId: e.id, unit }),
  });
}

function researchRows(session: Session, e: Entity): HTMLElement | null {
  const player = session.state.players[viewerOf(session.state)];
  if (e.building?.type !== 'lab' || e.building.level < 1 || !player) return null;
  const current = player.research.current;
  const rows: (HTMLElement | null)[] = [];
  const cur = current && RESEARCH_LIST.find((r) => r.id === current.id);
  if (current && cur)
    rows.push(
      progress(tx(cur.name), current.finishAt - stageSeconds(cur.stage) * 1000, current.finishAt),
      speedResearchButton(session),
    );
  for (const r of RESEARCH_LIST.filter(
    (x) => !player.research.done.includes(x.id) && x.id !== current?.id,
  ))
    rows.push(
      action('flask-round', tx(r.name), {
        cost: r.cost,
        have: player.resources,
        timeMs: stageSeconds(r.stage) * 1000,
        title: tx(r.description),
        disabled: !!current,
        onclick: () => session.command({ type: 'research', player: session.me, research: r.id }),
      }),
    );
  if (player.research.done.length)
    rows.push(text(t('doneCount', { n: player.research.done.length }), 'p-text muted'));
  return section(t('catResearch'), ...rows);
}

/** Life, colony values, armor, weapon and shield of a building. */
function fightStats(e: Entity): HTMLElement[] {
  const out: HTMLElement[] = [];
  if (!e.building || e.building.level < 1) return out;
  const lvl = buildingLevel(BUILDINGS[e.building.type], e.building.level);
  if (e.health && e.health.hp < e.health.max)
    out.push(stat('heart', t('life'), `${Math.ceil(e.health.hp)} / ${e.health.max}`, '#ff6b81'));
  out.push(...colonyStats(lvl));
  if (lvl.armor) out.push(stat('shield', t('armor'), String(lvl.armor), '#9fb4cc'));
  if (lvl.weapon) out.push(stat('crosshair', t('damage'), String(lvl.weapon.damage), '#ffb35a'));
  if (e.shield)
    out.push(
      stat('shield-check', t('shield'), `${Math.ceil(e.shield.hp)} / ${e.shield.max}`, '#5ab8ff'),
    );
  return out;
}

/** Panel for a building of another side: look, but no buttons. */
function enemyPanel(session: Session, e: Entity): HTMLElement[] {
  if (!e.building) return [];
  const s = session.state;
  const def = BUILDINGS[e.building.type];
  const war = hostile(s, viewerOf(s), e.owner);
  return [
    header(
      tx(nameOfBuilding(s, e.owner, def.id)),
      ownerLabel(s, e.owner, t('building')),
      thumb(def.id, 'p-thumb', factionOf(s, e.owner)),
    ),
    levelPips(e.building.level, def.levels.length),
    ...fightStats(e),
    text(war ? t('attackHere') : t('noWarAttack'), 'p-text muted'),
  ];
}

export function buildingPanel(session: Session, e: Entity): HTMLElement[] {
  if (!e.building) return [];
  if (e.owner !== session.me) return enemyPanel(session, e);
  const def = BUILDINGS[e.building.type];
  const faction = session.ui.faction;
  const out: (HTMLElement | null)[] = [
    header(
      tx(nameOfBuilding(session.state, viewerOf(session.state), def.id)),
      CATEGORY[def.category],
      thumb(def.id, 'p-thumb', faction),
    ),
    levelPips(e.building.level, def.levels.length),
    text(tx(buildingDescription(def.id, faction)), 'p-text muted'),
    ...fightStats(e),
  ];
  const c = e.construction;
  if (c)
    out.push(
      progress(
        e.building.level === 0 ? t('beingBuilt') : t('beingUpgraded'),
        c.startedAt,
        c.finishAt,
      ),
      speedEntityButton(session, e),
    );
  out.push(upgradeRow(session, e), trainRows(session, e), researchRows(session, e));
  return out.filter((x): x is HTMLElement => !!x);
}

/** Changes when the building panel must be rebuilt (not every second). */
export function buildingKey(session: Session, e: Entity): string {
  const p = session.state.players[viewerOf(session.state)];
  return JSON.stringify([
    e.building,
    !!e.construction,
    e.training?.unit,
    e.training?.queue.length,
    p?.research,
    Math.ceil((e.health?.hp ?? 0) / 10),
    Math.ceil((e.shield?.hp ?? 0) / 50),
    speedKey(session, e),
  ]);
}
