import { RESOURCE_IDS, RESOURCE_INFO } from '../content/resources';
import type { Session, Speed } from '../app/session';
import { playerStats } from '../sim/stats';
import type { ViewName } from '../render/views/view';
import { el, formatNumber } from './dom';

const VIEWS: { name: ViewName; label: string }[] = [
  { name: 'surface', label: '🏠 Basis' },
  { name: 'planet', label: '🌍 Planet' },
  { name: 'system', label: '☀️ System' },
];

export interface HudActions {
  goView(name: ViewName): void;
  openMenu(): void;
}

/** Top bar: resources, energy, drones, view buttons. */
export class Hud {
  readonly root = el('div', { class: 'hud' });
  private values = new Map<string, HTMLElement>();
  private viewButtons = new Map<ViewName, HTMLElement>();
  private speedButton = el('button', {
    class: 'chip',
    title: 'Spiel-Geschwindigkeit (zum Testen)',
  });

  constructor(
    private session: Session,
    actions: HudActions,
  ) {
    const res = el('div', { class: 'resources' });
    for (const id of RESOURCE_IDS)
      res.append(this.item(id, RESOURCE_INFO[id].icon, RESOURCE_INFO[id].name));
    res.append(this.item('energy', '⚡', 'Energie: erzeugt / verbraucht'));
    res.append(this.item('drones', '🛸', 'Freie Bau-Drohnen'));
    res.append(this.item('housing', '🏠', 'Platz für Einheiten'));
    const views = el('div', { class: 'views' });
    for (const v of VIEWS) {
      const b = el('button', { class: 'chip', onclick: () => actions.goView(v.name) }, v.label);
      this.viewButtons.set(v.name, b);
      views.append(b);
    }
    this.speedButton.onclick = () => this.cycleSpeed();
    views.append(
      this.speedButton,
      el('button', { class: 'chip', onclick: () => actions.openMenu() }, '☰'),
    );
    this.root.append(res, views);
  }

  update(): void {
    const s = this.session;
    const player = s.state.players.player;
    if (!player) return;
    const stats = playerStats(s.state, 'player');
    for (const id of RESOURCE_IDS)
      this.set(
        id,
        `${formatNumber(player.resources[id] ?? 0)}`,
        (player.resources[id] ?? 0) >= stats.storage,
      );
    this.set(
      'energy',
      `${Math.round(stats.energyMade)}/${Math.round(stats.energyUsed)}`,
      stats.efficiency < 1,
    );
    this.set('drones', `${stats.freeDrones}/${stats.drones}`, stats.freeDrones === 0);
    this.set(
      'housing',
      `${stats.housingUsed}/${stats.housing}`,
      stats.housingUsed >= stats.housing,
    );
    for (const [name, b] of this.viewButtons) b.classList.toggle('active', name === s.ui.view);
    this.speedButton.textContent = `⏩ x${s.speed}`;
  }

  private item(key: string, icon: string, title: string): HTMLElement {
    const value = el('span', { class: 'value' }, '0');
    this.values.set(key, value);
    return el('div', { class: 'res', title }, el('span', { class: 'icon' }, icon), value);
  }

  private set(key: string, text: string, warn: boolean): void {
    const v = this.values.get(key);
    if (!v) return;
    if (v.textContent !== text) v.textContent = text;
    v.classList.toggle('warn', warn);
  }

  private cycleSpeed(): void {
    const order: Speed[] = [1, 10, 100];
    this.session.speed = order[(order.indexOf(this.session.speed) + 1) % order.length] ?? 1;
  }
}
