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
import { action, header, levelPips, progress, section, stat, text } from './panel-kit';

export { timer } from './panel-kit';

const CATEGORY: Record<BuildingCategory, string> = {
  command: 'Kommando',
  energy: 'Energie',
  mining: 'Abbau',
  housing: 'Wohnen',
  processing: 'Verarbeitung',
  food: 'Nahrung',
  military: 'Militär',
  research: 'Forschung',
  space: 'Raumfahrt',
  defense: 'Verteidigung',
};

function upgradeRow(session: Session, e: Entity): HTMLElement | null {
  if (!e.building || e.construction) return null;
  const def = BUILDINGS[e.building.type];
  const next = e.building.level + 1;
  if (next > def.levels.length) return text('Höchste Stufe erreicht.', 'p-text muted');
  return action('arrow-up', `Ausbauen auf Stufe ${next}`, {
    cost: buildingLevel(def, next).cost,
    have: session.state.players.player?.resources,
    timeMs: buildTimeSeconds(def, next) * 1000,
    onclick: () => session.command({ type: 'upgrade', player: 'player', entityId: e.id }),
  });
}

function trainRows(session: Session, e: Entity): HTMLElement | null {
  const trains = e.building ? (BUILDINGS[e.building.type].trains ?? []) : [];
  if (!e.building || e.building.level < 1 || !trains.length) return null;
  const rows: HTMLElement[] = [];
  const name = (id: keyof typeof UNITS): string => nameOfUnit(session.state, 'player', id);
  if (e.training) {
    const u = UNITS[e.training.unit];
    const q = e.training.queue.length;
    const label = `${name(u.id)}${q ? ` (+${q} in Warteschlange)` : ''}`;
    rows.push(progress(label, e.training.finishAt - u.trainSeconds * 1000, e.training.finishAt));
  }
  for (const unit of trains) rows.push(trainButton(session, e, unit, name(unit)));
  return section('Einheiten', ...rows);
}

/** Train button. Locked (with the research name) when the unit needs research. */
function trainButton(session: Session, e: Entity, unit: UnitId, label: string): HTMLElement {
  const need = UNITS[unit].requires;
  const locked = !!need && !hasResearch(session.state, 'player', need);
  return action(locked ? 'lock' : 'plus', label, {
    cost: UNITS[unit].cost,
    have: session.state.players.player?.resources,
    timeMs: UNITS[unit].trainSeconds * 1000,
    disabled: locked,
    title: locked && need ? `Braucht Forschung: ${RESEARCH[need].name}` : undefined,
    onclick: () => session.command({ type: 'train', player: 'player', buildingId: e.id, unit }),
  });
}

function researchRows(session: Session, e: Entity): HTMLElement | null {
  const player = session.state.players.player;
  if (e.building?.type !== 'lab' || e.building.level < 1 || !player) return null;
  const current = player.research.current;
  const rows: HTMLElement[] = [];
  const cur = current && RESEARCH_LIST.find((r) => r.id === current.id);
  if (current && cur)
    rows.push(
      progress(cur.name, current.finishAt - stageSeconds(cur.stage) * 1000, current.finishAt),
    );
  for (const r of RESEARCH_LIST.filter(
    (x) => !player.research.done.includes(x.id) && x.id !== current?.id,
  ))
    rows.push(
      action('flask-round', r.name, {
        cost: r.cost,
        have: player.resources,
        timeMs: stageSeconds(r.stage) * 1000,
        title: r.description,
        disabled: !!current,
        onclick: () => session.command({ type: 'research', player: 'player', research: r.id }),
      }),
    );
  if (player.research.done.length)
    rows.push(text(`Schon erforscht: ${player.research.done.length}`, 'p-text muted'));
  return section('Forschung', ...rows);
}

/** Life, armor, weapon and shield of a building. */
function fightStats(e: Entity): HTMLElement[] {
  const out: HTMLElement[] = [];
  if (!e.building || e.building.level < 1) return out;
  const lvl = buildingLevel(BUILDINGS[e.building.type], e.building.level);
  if (e.health && e.health.hp < e.health.max)
    out.push(stat('heart', 'Leben', `${Math.ceil(e.health.hp)} / ${e.health.max}`, '#ff6b81'));
  if (lvl.armor) out.push(stat('shield', 'Panzerung', String(lvl.armor), '#9fb4cc'));
  if (lvl.weapon) out.push(stat('crosshair', 'Schaden', String(lvl.weapon.damage), '#ffb35a'));
  if (e.shield)
    out.push(
      stat('shield-check', 'Schild', `${Math.ceil(e.shield.hp)} / ${e.shield.max}`, '#5ab8ff'),
    );
  return out;
}

/** Panel for a building of the other side: look, but no buttons. */
function enemyPanel(session: Session, e: Entity): HTMLElement[] {
  if (!e.building) return [];
  const def = BUILDINGS[e.building.type];
  const faction = factionOf(session.state, e.owner);
  return [
    header(
      nameOfBuilding(session.state, e.owner, def.id),
      'Feind',
      thumb(def.id, 'p-thumb', faction),
    ),
    levelPips(e.building.level, def.levels.length),
    ...fightStats(e),
    text('Wählt Einheiten und tippt hierher, um anzugreifen.', 'p-text muted'),
  ];
}

export function buildingPanel(session: Session, e: Entity): HTMLElement[] {
  if (!e.building) return [];
  if (e.owner !== 'player') return enemyPanel(session, e);
  const def = BUILDINGS[e.building.type];
  const faction = session.ui.faction;
  const out: (HTMLElement | null)[] = [
    header(
      nameOfBuilding(session.state, 'player', def.id),
      CATEGORY[def.category],
      thumb(def.id, 'p-thumb', faction),
    ),
    levelPips(e.building.level, def.levels.length),
    text(buildingDescription(def.id, faction), 'p-text muted'),
    ...fightStats(e),
  ];
  const c = e.construction;
  if (c)
    out.push(
      progress(e.building.level === 0 ? 'Wird gebaut' : 'Wird ausgebaut', c.startedAt, c.finishAt),
    );
  out.push(upgradeRow(session, e), trainRows(session, e), researchRows(session, e));
  return out.filter((x): x is HTMLElement => !!x);
}

/** Changes when the building panel must be rebuilt (not every second). */
export function buildingKey(session: Session, e: Entity): string {
  const p = session.state.players.player;
  return JSON.stringify([
    e.building,
    !!e.construction,
    e.training?.unit,
    e.training?.queue.length,
    p?.research,
    Math.ceil((e.health?.hp ?? 0) / 10),
    Math.ceil((e.shield?.hp ?? 0) / 50),
  ]);
}
