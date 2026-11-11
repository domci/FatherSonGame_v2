import { BUILDINGS, buildingLevel, type BuildingDef, type BuildingId } from '../content/buildings';
import { BUILDING_LIST } from '../content/building-list';
import { buildingDescription, buildingName, type Faction } from '../content/factions';
import { RESEARCH_LIST } from '../content/research';
import type { Session } from '../app/session';
import { hasResearch } from '../sim/research-helpers';
import { canAfford } from '../sim/wallet';
import { el } from './dom';
import { costText } from './format';
import { costChips, icon, type IconName } from './icons';

/** Picture of a building (rendered from its 3D model, see tools/thumbs). */
export function thumb(id: BuildingId, cls = 'thumb', faction: Faction = 'human'): HTMLElement {
  return el('img', {
    class: cls,
    src: `${import.meta.env.BASE_URL}ui/thumbs/${faction}/${id}.png`,
    alt: '',
    draggable: 'false',
  });
}

function researchName(id: string | undefined): string {
  return RESEARCH_LIST.find((r) => r.id === id)?.name ?? '';
}

type Tab = 'base' | 'army' | 'defense';

const TABS: { id: Tab; label: string; icon: IconName }[] = [
  { id: 'base', label: 'Basis', icon: 'house' },
  { id: 'army', label: 'Militär', icon: 'swords' },
  { id: 'defense', label: 'Schutz', icon: 'shield' },
];

function tabOf(def: BuildingDef): Tab {
  if (def.category === 'defense') return 'defense';
  const army = ['infantry', 'tank', 'fighter'];
  return def.trains?.some((u) => army.includes(u)) ? 'army' : 'base';
}

interface Card {
  root: HTMLButtonElement;
  cost: HTMLElement;
  tab: Tab;
}

/** Bottom bar with all buildings in three tabs. Tap one, then tap the ground to place it. */
export class BuildMenu {
  readonly root = el('div', { class: 'panel build-bar' });
  private cards = new Map<BuildingId, Card>();
  private tabButtons = new Map<Tab, HTMLElement>();
  private tab: Tab = 'base';
  private cancel = el(
    'button',
    { class: 'build-cancel', onclick: () => this.session.startPlacing(undefined) },
    icon('x'),
    el('span', {}, 'Abbrechen'),
  );
  private lastHave = '';

  constructor(private session: Session) {
    const tabs = el('div', { class: 'build-tabs' });
    for (const t of TABS) {
      const b = el(
        'button',
        { class: 'build-tab', title: t.label, onclick: () => this.setTab(t.id) },
        icon(t.icon),
        el('span', {}, t.label),
      );
      this.tabButtons.set(t.id, b);
      tabs.append(b);
    }
    this.root.append(tabs);
    for (const def of BUILDING_LIST.filter((b) => !b.unique)) this.addCard(def);
    this.root.append(this.cancel);
    this.setTab('base');
  }

  update(): void {
    const s = this.session;
    const player = s.state.players.player;
    this.root.hidden = s.ui.view !== 'surface' || s.ui.zone !== s.state.system.homeBodyId;
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
      if (locked)
        card.root.title = `${this.name(id)} – erst erforschen: ${researchName(def.requires)}`;
      card.root.classList.toggle('poor', !player || !canAfford(player, cost));
      card.root.classList.toggle('on', s.ui.placing === id);
      if (fresh) card.cost.replaceChildren(costChips(cost, player?.resources));
    }
  }

  private name(id: BuildingId): string {
    return buildingName(id, this.session.ui.faction);
  }

  private addCard(def: BuildingDef): void {
    const faction = this.session.ui.faction;
    const cost = el('span', { class: 'card-cost' });
    const card = el(
      'button',
      {
        class: 'build-card',
        title: `${this.name(def.id)}: ${buildingDescription(def.id, faction)}\nKosten: ${costText(buildingLevel(def, 1).cost)}`,
        onclick: () => this.pick(def.id),
        'data-building': def.id,
      },
      el(
        'span',
        { class: 'card-img' },
        thumb(def.id, 'thumb', faction),
        el('span', { class: 'lock' }, icon('lock')),
      ),
      el('span', { class: 'card-name' }, this.name(def.id)),
      cost,
    );
    this.cards.set(def.id, { root: card, cost, tab: tabOf(def) });
    this.root.append(card);
  }

  private setTab(tab: Tab): void {
    this.tab = tab;
    for (const [id, b] of this.tabButtons) b.classList.toggle('on', id === tab);
    for (const card of this.cards.values()) card.root.hidden = card.tab !== this.tab;
  }

  private pick(id: BuildingId): void {
    this.session.startPlacing(this.session.ui.placing === id ? undefined : id);
  }
}
