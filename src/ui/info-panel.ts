import type { Session } from '../app/session';
import { findEntity } from '../sim/spawn';
import { clear, el } from './dom';
import { icon } from './icons';
import { header, tickTimers } from './panel-kit';
import { buildingKey, buildingPanel } from './panel-building';
import { bodyPanel, unitPanel, wildPanel } from './panel-other';

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
    const ships = s.state.world
      .with('ship')
      .entities.map((e) => e.ship.phase)
      .join();
    if (s.ui.selectedBodyId)
      return {
        key: `body:${s.ui.selectedBodyId}:${ships}`,
        build: () => bodyPanel(s, s.ui.selectedBodyId ?? ''),
      };
    const ids = [...s.ui.selectedIds];
    const first = ids[0] === undefined ? undefined : findEntity(s.state, ids[0]);
    if (!first) return { key: 'none', build: () => [] };
    if (ids.length > 1)
      return {
        key: `multi:${ids.join()}`,
        build: () => [header(`${ids.length} Einheiten`, 'Auswahl')],
      };
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
