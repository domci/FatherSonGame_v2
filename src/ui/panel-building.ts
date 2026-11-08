import { BUILDINGS, buildingLevel, type BuildingCategory } from '../content/buildings';
import { RESEARCH_LIST } from '../content/research';
import { stageSeconds } from '../content/time-curve';
import { UNITS } from '../content/units';
import type { Session } from '../app/session';
import type { Entity } from '../sim/entity';
import { thumb } from './build-menu';
import { action, header, levelPips, progress, section, text } from './panel-kit';

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
};

function upgradeRow(session: Session, e: Entity): HTMLElement | null {
  if (!e.building || e.construction) return null;
  const def = BUILDINGS[e.building.type];
  const next = e.building.level + 1;
  if (next > def.levels.length) return text('Höchste Stufe erreicht.', 'p-text muted');
  return action('arrow-up', `Ausbauen auf Stufe ${next}`, {
    cost: buildingLevel(def, next).cost,
    have: session.state.players.player?.resources,
    timeMs: stageSeconds(def.tier + next - 1) * 1000,
    onclick: () => session.command({ type: 'upgrade', player: 'player', entityId: e.id }),
  });
}

function trainRows(session: Session, e: Entity): HTMLElement | null {
  const trains = e.building ? (BUILDINGS[e.building.type].trains ?? []) : [];
  if (!e.building || e.building.level < 1 || !trains.length) return null;
  const rows: HTMLElement[] = [];
  if (e.training) {
    const u = UNITS[e.training.unit];
    const q = e.training.queue.length;
    const label = `${u.name}${q ? ` (+${q} in Warteschlange)` : ''}`;
    rows.push(progress(label, e.training.finishAt - u.trainSeconds * 1000, e.training.finishAt));
  }
  for (const unit of trains)
    rows.push(
      action('plus', UNITS[unit].name, {
        cost: UNITS[unit].cost,
        have: session.state.players.player?.resources,
        timeMs: UNITS[unit].trainSeconds * 1000,
        onclick: () => session.command({ type: 'train', player: 'player', buildingId: e.id, unit }),
      }),
    );
  return section('Einheiten', ...rows);
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

export function buildingPanel(session: Session, e: Entity): HTMLElement[] {
  if (!e.building) return [];
  const def = BUILDINGS[e.building.type];
  const out: (HTMLElement | null)[] = [
    header(def.name, CATEGORY[def.category], thumb(def.id, 'p-thumb')),
    levelPips(e.building.level, def.levels.length),
    text(def.description, 'p-text muted'),
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
  ]);
}
