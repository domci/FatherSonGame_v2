import { BUILDINGS, buildingLevel } from '../content/buildings';
import { RESEARCH_LIST } from '../content/research';
import { stageSeconds } from '../content/time-curve';
import { UNITS } from '../content/units';
import type { Session } from '../app/session';
import type { Entity } from '../sim/entity';
import { el } from './dom';
import { costText } from './format';

export function timer(until: number): HTMLElement {
  return el('span', { class: 'timer', 'data-until': String(until) }, '…');
}

function upgradeRow(session: Session, e: Entity): HTMLElement | null {
  if (!e.building || e.construction) return null;
  const def = BUILDINGS[e.building.type];
  const next = e.building.level + 1;
  if (next > def.levels.length) return el('p', { class: 'muted' }, 'Höchste Stufe erreicht.');
  const time = stageSeconds(def.tier + next - 1) * 1000;
  const cost = costText(buildingLevel(def, next).cost);
  return el(
    'button',
    {
      class: 'action',
      onclick: () => session.command({ type: 'upgrade', player: 'player', entityId: e.id }),
    },
    `⬆ Auf Stufe ${next} (${cost}, ${Math.round(time / 60000) || '<1'} Min)`,
  );
}

function trainRows(session: Session, e: Entity): HTMLElement[] {
  if (!e.building || e.building.level < 1) return [];
  const rows: HTMLElement[] = (BUILDINGS[e.building.type].trains ?? []).map((unit) =>
    el(
      'button',
      {
        class: 'action',
        onclick: () => session.command({ type: 'train', player: 'player', buildingId: e.id, unit }),
      },
      `➕ ${UNITS[unit].name} (${costText(UNITS[unit].cost)})`,
    ),
  );
  if (e.training) {
    const q = e.training.queue.length;
    rows.unshift(
      el(
        'p',
        {},
        `Baut: ${UNITS[e.training.unit].name} – `,
        timer(e.training.finishAt),
        q ? ` (+${q} warten)` : '',
      ),
    );
  }
  return rows;
}

function researchRows(session: Session, e: Entity): HTMLElement[] {
  if (e.building?.type !== 'lab' || e.building.level < 1) return [];
  const player = session.state.players.player;
  if (!player) return [];
  const current = player.research.current;
  const rows: HTMLElement[] = [el('h4', {}, '🔬 Forschung')];
  if (current)
    rows.push(
      el(
        'p',
        {},
        `Forscht: ${RESEARCH_LIST.find((r) => r.id === current.id)?.name} – `,
        timer(current.finishAt),
      ),
    );
  for (const r of RESEARCH_LIST.filter(
    (x) => !player.research.done.includes(x.id) && x.id !== current?.id,
  )) {
    const mins = Math.max(1, Math.round(stageSeconds(r.stage) / 60));
    rows.push(
      el(
        'button',
        {
          class: 'action',
          title: r.description,
          onclick: () => session.command({ type: 'research', player: 'player', research: r.id }),
        },
        `${r.name} (${costText(r.cost)}, ${mins} Min)`,
      ),
    );
  }
  if (player.research.done.length)
    rows.push(el('p', { class: 'muted' }, `Fertig: ${player.research.done.length}`));
  return rows;
}

export function buildingPanel(session: Session, e: Entity): HTMLElement[] {
  if (!e.building) return [];
  const def = BUILDINGS[e.building.type];
  const out: HTMLElement[] = [
    el('h3', {}, `${def.name}`),
    el('p', { class: 'muted' }, def.description),
  ];
  out.push(el('p', {}, `Stufe ${e.building.level} von ${def.levels.length}`));
  if (e.construction)
    out.push(el('p', { class: 'busy' }, `🛠 Bau läuft – `, timer(e.construction.finishAt)));
  const up = upgradeRow(session, e);
  if (up) out.push(up);
  return [...out, ...trainRows(session, e), ...researchRows(session, e)];
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
