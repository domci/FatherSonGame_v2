import type { Session } from '../app/session';
import { findEntity } from '../sim/spawn';
import { clear, el } from './dom';
import { icon } from './icons';
import { header, tickTimers } from './panel-kit';
import { buildingKey, buildingPanel } from './panel-building';
import { bodyPanel, unitPanel, wildPanel } from './panel-other';
import { boardButtons } from './panel-transport';
import { fleetKey } from './panel-fleet';
import { colonyKey, colonyPanel } from './panel-colony';
import { text } from './panel-kit';
import { nameOfUnit } from '../sim/names';
import type { UnitId } from '../content/units';

/** Several selected units: how many of each kind, and what they can do together. */
function multiPanel(session: Session, ids: number[]): HTMLElement[] {
  const counts = new Map<UnitId, number>();
  for (const id of ids) {
    const type = findEntity(session.state, id)?.unit?.type;
    if (type) counts.set(type, (counts.get(type) ?? 0) + 1);
  }
  const list = [...counts].map(([t, n]) => `${n}× ${nameOfUnit(session.state, 'player', t)}`);
  return [
    header(`${ids.length} Einheiten`, 'Auswahl'),
    text(list.join(', ')),
    text(
      'Tippt auf den Boden zum Laufen (sie kämpfen unterwegs) oder auf einen Feind.',
      'p-text muted',
    ),
    ...boardButtons(session, ids),
  ];
}

/** Right side panel: details and actions for what is selected. */
export class InfoPanel {
  readonly root = el('div', { class: 'panel info-panel' });
  private key = '';

  constructor(private session: Session) {}

  update(): void {
    const { key, build } = this.content();
    if (key !== this.key) {
      this.key = key;
      clear(this.root);
      const parts = build();
      this.root.hidden = parts.length === 0;
      if (parts.length)
        this.root.append(
          el(
            'button',
            { class: 'icon-btn close', title: 'Schließen', onclick: () => this.session.select([]) },
            icon('x'),
          ),
          ...parts,
        );
    }
    tickTimers(this.root, this.session.state.time);
  }

  private content(): { key: string; build: () => HTMLElement[] } {
    const s = this.session;
    if (s.ui.panel === 'colony') return { key: colonyKey(s), build: () => colonyPanel(s) };
    return this.selected();
  }

  private selected(): { key: string; build: () => HTMLElement[] } {
    const s = this.session;
    const ships = s.state.world
      .with('ship')
      .entities.map((e) => e.ship.phase)
      .join();
    if (s.ui.selectedBodyId)
      return {
        key: `body:${s.ui.selectedBodyId}:${ships}:${fleetKey(s)}`,
        build: () => bodyPanel(s, s.ui.selectedBodyId ?? ''),
      };
    const ids = [...s.ui.selectedIds];
    const first = ids[0] === undefined ? undefined : findEntity(s.state, ids[0]);
    if (!first) return { key: 'none', build: () => [] };
    if (ids.length > 1)
      return { key: `multi:${ids.join()}:${ships}`, build: () => multiPanel(s, ids) };
    if (first.building)
      return {
        key: `b:${first.id}:${buildingKey(s, first)}`,
        build: () => buildingPanel(s, first),
      };
    if (first.unit)
      return {
        key: `u:${first.id}:${first.busyWith?.entityId}:${first.ship?.phase}:${first.ship?.repeat}:${Math.ceil(first.health?.hp ?? 0)}`,
        build: () => unitPanel(s, first),
      };
    return { key: `w:${first.id}`, build: () => wildPanel(first) };
  }
}
