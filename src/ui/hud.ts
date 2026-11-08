import { RESOURCE_IDS, RESOURCE_INFO } from '../content/resources';
import type { Session, Speed } from '../app/session';
import { playerStats } from '../sim/stats';
import type { ViewName } from '../render/views/view';
import { el, formatNumber } from './dom';
import { icon, resourceIcon, type IconName } from './icons';

const VIEWS: { name: ViewName; label: string; icon: IconName }[] = [
  { name: 'surface', label: 'Basis', icon: 'house' },
  { name: 'planet', label: 'Planet', icon: 'globe' },
  { name: 'system', label: 'System', icon: 'orbit' },
];

export interface HudActions {
  goView(name: ViewName): void;
  openMenu(): void;
}

/** Top bar: resources and status on the left, views and menu on the right. */
export class Hud {
  readonly root = el('div', { class: 'hud' });
  private values = new Map<string, HTMLElement>();
  private viewButtons = new Map<ViewName, HTMLElement>();
  private speedLabel = el('span', {}, 'x1');

  constructor(
    private session: Session,
    actions: HudActions,
  ) {
    const res = el('div', { class: 'panel res-bar' });
    for (const id of RESOURCE_IDS)
      res.append(this.item(id, resourceIcon(id), RESOURCE_INFO[id].name));
    res.append(el('span', { class: 'divider' }));
    res.append(this.item('energy', icon('zap', '#ffd25a'), 'Energie: erzeugt / verbraucht'));
    res.append(this.item('drones', icon('bot', '#7fd4ff'), 'Freie Bau-Drohnen'));
    res.append(this.item('housing', icon('users', '#c9d4e3'), 'Platz für Einheiten'));
    const nav = el('div', { class: 'panel seg' });
    for (const v of VIEWS) {
      const b = el(
        'button',
        { class: 'seg-btn', onclick: () => actions.goView(v.name), title: v.label },
        icon(v.icon),
        el('span', { class: 'seg-label' }, v.label),
      );
      this.viewButtons.set(v.name, b);
      nav.append(b);
    }
    const tools = el(
      'div',
      { class: 'panel seg' },
      el(
        'button',
        { class: 'seg-btn', title: 'Spiel-Geschwindigkeit', onclick: () => this.cycleSpeed() },
        icon('fast-forward'),
        this.speedLabel,
      ),
      el(
        'button',
        { class: 'seg-btn', title: 'Menü', onclick: () => actions.openMenu() },
        icon('menu'),
      ),
    );
    this.root.append(res, el('div', { class: 'hud-right' }, nav, tools));
  }

  update(): void {
    const s = this.session;
    const player = s.state.players.player;
    if (!player) return;
    const stats = playerStats(s.state, 'player');
    for (const id of RESOURCE_IDS) {
      const v = player.resources[id] ?? 0;
      this.set(id, formatNumber(v), v >= stats.storage ? 'warn' : v < 1 ? 'zero' : '');
    }
    const energyLow = stats.efficiency < 1;
    this.set(
      'energy',
      `${Math.round(stats.energyMade)}/${Math.round(stats.energyUsed)}`,
      energyLow ? 'bad' : '',
    );
    this.set('drones', `${stats.freeDrones}/${stats.drones}`, stats.freeDrones === 0 ? 'warn' : '');
    const full = stats.housingUsed >= stats.housing;
    this.set('housing', `${stats.housingUsed}/${stats.housing}`, full ? 'warn' : '');
    for (const [name, b] of this.viewButtons) b.classList.toggle('on', name === s.ui.view);
    this.speedLabel.textContent = `x${s.speed}`;
  }

  private item(key: string, ico: HTMLElement, title: string): HTMLElement {
    const value = el('span', { class: 'val' }, '0');
    const item = el('div', { class: 'res', title }, ico, value);
    this.values.set(key, item);
    return item;
  }

  private set(key: string, text: string, state: '' | 'warn' | 'bad' | 'zero'): void {
    const item = this.values.get(key);
    const v = item?.lastElementChild;
    if (!item || !v) return;
    if (v.textContent !== text) v.textContent = text;
    item.className = `res ${state}`;
  }

  private cycleSpeed(): void {
    const order: Speed[] = [1, 10, 100];
    this.session.speed = order[(order.indexOf(this.session.speed) + 1) % order.length] ?? 1;
  }
}
