import { viewerOf } from '../sim/viewer';
import { RESOURCE_IDS, RESOURCE_INFO } from '../content/resources';
import type { Session, Speed } from '../app/session';
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

const MOOD_COLOR: Partial<Record<IconName, string>> = {
  smile: '#5fe08a',
  meh: '#ffc94d',
  frown: '#ff5d6c',
};

export interface HudActions {
  goView(name: ViewName): void;
  openMenu(): void;
  openColony(): void;
  openQuiz(): void;
  openPeoples(): void;
  /** More buttons in front of the tool bar (online: chat). */
  extraButtons?: HTMLElement[];
}

/** Top bar: resources and status on the left, views and menu on the right. */
export class Hud {
  readonly root = el('div', { class: 'hud' });
  private values = new Map<string, HTMLElement>();
  private viewButtons = new Map<ViewName, HTMLElement>();
  private speedLabel = el('span', {}, 'x1');
  private moodIcon = icon('smile', '#5fe08a');
  private moodShown = '';
  private quizButton = el('button', { class: 'seg-btn', title: 'Wissens-Quiz' }, icon('brain'));
  private peoplesButton = el(
    'button',
    { class: 'seg-btn', title: 'Völker: Krieg, Frieden, Bündnis' },
    icon('handshake'),
  );

  constructor(
    private session: Session,
    actions: HudActions,
  ) {
    this.quizButton.onclick = () => actions.openQuiz();
    this.peoplesButton.onclick = () => actions.openPeoples();
    this.peoplesButton.hidden = !session.state.settings.opponent && !session.net;
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
    const people = this.item('people', this.moodIcon, 'Bewohner und Laune: Bewohner / Wohnplätze');
    people.classList.add('click');
    people.onclick = () => actions.openColony();
    res.append(people);
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
    const speed = el(
      'button',
      { class: 'seg-btn', title: 'Spiel-Geschwindigkeit', onclick: () => this.cycleSpeed() },
      icon('fast-forward'),
      this.speedLabel,
    );
    // Online the server sets the pace for everybody.
    speed.hidden = !!this.session.net;
    return el(
      'div',
      { class: 'panel seg' },
      ...(actions.extraButtons ?? []),
      this.peoplesButton,
      this.quizButton,
      speed,
      el(
        'button',
        { class: 'seg-btn', title: 'Menü', onclick: () => actions.openMenu() },
        icon('menu'),
      ),
    );
  }

  update(): void {
    const s = this.session;
    const player = s.state.players[viewerOf(s.state)];
    if (!player) return;
    const stats = playerStats(s.state, viewerOf(s.state));
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
    const offer = s.state.offers.some((o) => o.to === viewerOf(s.state));
    this.peoplesButton.classList.toggle('offer-open', offer);
    this.peoplesButton.classList.toggle('on', s.ui.panel === 'peoples');
    for (const [name, b] of this.viewButtons) b.classList.toggle('on', name === s.ui.view);
    this.speedLabel.textContent = `x${s.speed}`;
  }

  private colony(c: ColonyState, stats: PlayerStats): void {
    const bad = c.sick >= 1 || c.mood < 35;
    const warn = c.people >= stats.residents || c.mood < 60;
    this.set('people', `${c.people}/${stats.residents}`, bad ? 'bad' : warn ? 'warn' : '');
    const name = moodIcon(c.mood);
    if (name === this.moodShown) return;
    this.moodShown = name;
    const next = icon(name, MOOD_COLOR[name] ?? '#ffd25a');
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
