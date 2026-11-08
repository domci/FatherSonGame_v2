import { BUILDINGS, buildingLevel, type BuildingId } from '../content/buildings';
import { BUILDING_LIST } from '../content/building-list';
import { RESEARCH_LIST } from '../content/research';
import type { Session } from '../app/session';
import { hasResearch } from '../sim/research-helpers';
import { canAfford } from '../sim/wallet';
import { el } from './dom';
import { costText } from './format';
import { costChips, icon } from './icons';

/** Picture of a building (rendered from its 3D model, see tools/thumbs). */
export function thumb(id: BuildingId, cls = 'thumb'): HTMLElement {
  return el('img', {
    class: cls,
    src: `${import.meta.env.BASE_URL}ui/thumbs/${id}.png`,
    alt: '',
    draggable: 'false',
  });
}

function researchName(id: string | undefined): string {
  return RESEARCH_LIST.find((r) => r.id === id)?.name ?? '';
}

/** Bottom bar with all buildings. Tap one, then tap the ground to place it. */
export class BuildMenu {
  readonly root = el('div', { class: 'panel build-bar' });
  private cards = new Map<BuildingId, { root: HTMLButtonElement; cost: HTMLElement }>();
  private cancel = el(
    'button',
    { class: 'build-cancel', onclick: () => this.session.startPlacing(undefined) },
    icon('x'),
    el('span', {}, 'Abbrechen'),
  );
  private lastHave = '';

  constructor(private session: Session) {
    for (const def of BUILDING_LIST.filter((b) => !b.unique)) {
      const cost = el('span', { class: 'card-cost' });
      const card = el(
        'button',
        {
          class: 'build-card',
          title: `${def.name}: ${def.description}\nKosten: ${costText(buildingLevel(def, 1).cost)}`,
          onclick: () => this.pick(def.id),
        },
        el(
          'span',
          { class: 'card-img' },
          thumb(def.id),
          el('span', { class: 'lock' }, icon('lock')),
        ),
        el('span', { class: 'card-name' }, def.name),
        cost,
      );
      this.cards.set(def.id, { root: card, cost });
      this.root.append(card);
    }
    this.root.append(this.cancel);
  }

  update(): void {
    const s = this.session;
    const player = s.state.players.player;
    this.root.hidden = s.ui.view !== 'surface';
    this.cancel.hidden = !s.ui.placing;
    const have = JSON.stringify(player?.resources);
    const fresh = have !== this.lastHave;
    this.lastHave = have;
    for (const [id, card] of this.cards) {
      const def = BUILDINGS[id];
      const cost = buildingLevel(def, 1).cost;
      const locked = !!def.requires && !hasResearch(s.state, 'player', def.requires);
      card.root.classList.toggle('locked', locked);
      card.root.disabled = locked;
      if (locked) card.root.title = `${def.name} – erst erforschen: ${researchName(def.requires)}`;
      card.root.classList.toggle('poor', !player || !canAfford(player, cost));
      card.root.classList.toggle('on', s.ui.placing === id);
      if (fresh) card.cost.replaceChildren(costChips(cost, player?.resources));
    }
  }

  private pick(id: BuildingId): void {
    this.session.startPlacing(this.session.ui.placing === id ? undefined : id);
  }
}
