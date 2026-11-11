import { RESOURCE_IDS, RESOURCE_INFO } from '../content/resources';
import type { Session, Speed } from '../app/session';
import { healthy } from '../sim/colony';
import { quizStatus } from '../sim/quiz';
import type { ColonyState } from '../sim/state';
import { playerStats, type PlayerStats } from '../sim/stats';
import type { ViewName } from '../render/views/view';
import { el, formatNumber } from './dom';
import { icon, resourceIcon, type IconName } from './icons';
import { moodIcon } from './panel-colony';

const VIEWS: { name: ViewName; label: string; icon: IconName }[] = [
  { name: 'surface', label: 'Basis', icon: 'house' },
  { name: 'planet', label: 'Planet', icon: 'globe' },
  { name: 'system', label: 'System', icon: 'orbit' },
];

export interface HudActions {
  goView(name: ViewName): void;
  openMenu(): void;
  openColony(): void;
  openQuiz(): void;
}

/** Top bar: resources and status on the left, views and menu on the right. */
export class Hud {
  readonly root = el('div', { class: 'hud' });
  private values = new Map<string, HTMLElement>();
  private viewButtons = new Map<ViewName, HTMLElement>();
  private speedLabel = el('span', {}, 'x1');
  private moodIcon = icon('smile', '#ffd25a');
  private moodShown = '';
  private quizButton = el('button', { class: 'seg-btn', title: 'Wissens-Quiz' }, icon('brain'));

  constructor(
    private session: Session,
    actions: HudActions,
  ) {
    this.quizButton.onclick = () => actions.openQuiz();
    this.root.append(
      this.resBar(actions),
      el('div', { class: 'hud-right' }, this.navBar(actions), this.toolBar(actions)),
    );
  }

  private resBar(actions: HudActions): HTMLElement {
    const res = el('div', { class: 'panel res-bar' });
    for (const id of RESOURCE_IDS)
      res.append(this.item(id, resourceIcon(id), RESOURCE_INFO[id].name));
    res.append(el('span', { class: 'divider' }));
    res.append(this.item('energy', icon('zap', '#ffd25a'), 'Energie: erzeugt / verbraucht'));
    res.append(this.item('drones', icon('bot', '#7fd4ff'), 'Freie Bau-Drohnen'));
    res.append(this.item('housing', icon('shield', '#c9d4e3'), 'Platz für Einheiten'));
    res.append(el('span', { class: 'divider' }));
    const people = this.item('people', icon('users', '#9fe0b0'), 'Bewohner: gesund / alle');
    const mood = this.item('mood', this.moodIcon, 'Laune der Bewohner');
    for (const b of [people, mood]) {
      b.classList.add('click');
      b.onclick = () => actions.openColony();
    }
    res.append(people, mood);
    return res;
  }

  private navBar(actions: HudActions): HTMLElement {
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
    return nav;
  }

  private toolBar(actions: HudActions): HTMLElement {
    return el(
      'div',
      { class: 'panel seg' },
      this.quizButton,
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
    this.colony(player.colony, stats);
    this.quizButton.classList.toggle('quiz-ready', quizStatus(player.quiz, s.state.time).ready);
    for (const [name, b] of this.viewButtons) b.classList.toggle('on', name === s.ui.view);
    this.speedLabel.textContent = `x${s.speed}`;
  }

  private colony(c: ColonyState, stats: PlayerStats): void {
    const well = Math.floor(healthy(c));
    const state = c.sick >= 1 ? 'bad' : c.people >= stats.residents ? 'warn' : '';
    this.set('people', `${well}/${c.people}`, state);
    this.set('mood', String(Math.round(c.mood)), c.mood < 35 ? 'bad' : c.mood < 60 ? 'warn' : '');
    const name = moodIcon(c.mood);
    if (name === this.moodShown) return;
    this.moodShown = name;
    const next = icon(name, '#ffd25a');
    this.moodIcon.replaceWith(next);
    this.moodIcon = next;
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
    for (const c of ['warn', 'bad', 'zero']) item.classList.toggle(c, c === state);
  }

  private cycleSpeed(): void {
    const order: Speed[] = [1, 10, 100];
    this.session.speed = order[(order.indexOf(this.session.speed) + 1) % order.length] ?? 1;
  }
}
