import { BUILDINGS, buildingLevel, type BuildingId } from '../content/buildings';
import { BUILDING_LIST } from '../content/building-list';
import type { Session } from '../app/session';
import { hasResearch } from '../sim/research-helpers';
import { canAfford } from '../sim/wallet';
import { el } from './dom';
import { costText } from './format';

const ICONS: Record<BuildingId, string> = {
  commandDome: '🛰️',
  solarField: '☀️',
  regolithExcavator: '⛏️',
  habitatDome: '🏠',
  storage: '📦',
  pinkPump: '🧪',
  waterOxygenPlant: '💧',
  greenhouse: '🌱',
  huntingLodge: '🎯',
  lab: '🔬',
  diamondDrill: '💎',
  spaceport: '🚀',
};

/** Bottom bar with all buildings. Tap one, then tap the ground to place it. */
export class BuildMenu {
  readonly root = el('div', { class: 'build-menu' });
  private buttons = new Map<BuildingId, HTMLButtonElement>();
  private cancel = el(
    'button',
    { class: 'build-btn cancel', onclick: () => this.session.startPlacing(undefined) },
    '✖ Abbrechen',
  );

  constructor(private session: Session) {
    for (const def of BUILDING_LIST.filter((b) => !b.unique)) {
      const cost = costText(buildingLevel(def, 1).cost);
      const b = el(
        'button',
        {
          class: 'build-btn',
          title: `${def.description}\nKosten: ${cost}`,
          onclick: () => this.pick(def.id),
        },
        el('span', { class: 'b-icon' }, ICONS[def.id]),
        el('span', { class: 'b-name' }, def.name),
        el('span', { class: 'b-cost' }, cost),
      );
      this.buttons.set(def.id, b);
      this.root.append(b);
    }
    this.root.append(this.cancel);
  }

  update(): void {
    const s = this.session;
    const player = s.state.players.player;
    this.root.hidden = s.ui.view !== 'surface';
    this.cancel.hidden = !s.ui.placing;
    for (const [id, b] of this.buttons) {
      const def = BUILDINGS[id];
      const locked = !!def.requires && !hasResearch(s.state, 'player', def.requires);
      b.hidden = locked;
      b.classList.toggle('poor', !player || !canAfford(player, buildingLevel(def, 1).cost));
      b.classList.toggle('active', s.ui.placing === id);
    }
  }

  private pick(id: BuildingId): void {
    this.session.startPlacing(this.session.ui.placing === id ? undefined : id);
  }
}

export { ICONS as BUILDING_ICONS };
