import { viewerHome, viewerOf } from '../sim/viewer';
import { BUILDINGS } from '../content/buildings';
import { UNITS } from '../content/units';
import { RELATION_COLORS } from '../content/sides';
import type { Entity } from '../sim/entity';
import { relationOf } from '../sim/relations';
import type { GameState } from '../sim/state';
import { el } from './dom';

type Project = (x: number, y: number, lift?: number) => { x: number; y: number } | null;
type Kind = 'build' | 'train' | 'hp';
interface BarInfo {
  kind: Kind;
  value: number;
}

function progress(start: number, end: number, now: number): number {
  return Math.min(1, Math.max(0, (now - start) / Math.max(1, end - start)));
}

/** What bar (if any) an entity shows: building progress, training progress or health. */
export function barFor(e: Entity, now: number, selected: boolean): BarInfo | null {
  const c = e.construction;
  if (c) return { kind: 'build', value: progress(c.startedAt, c.finishAt, now) };
  const t = e.training;
  if (t) {
    const total = UNITS[t.unit].trainSeconds * 1000;
    return { kind: 'train', value: progress(t.finishAt - total, t.finishAt, now) };
  }
  const h = e.health;
  if (h && (h.hp < h.max || selected)) return { kind: 'hp', value: h.hp / h.max };
  return null;
}

/** Frame of a bar: the relation color for things of other sides, else the normal frame. */
function frameColor(state: GameState, e: Entity): string {
  if (!e.owner || e.owner === viewerOf(state)) return '';
  return RELATION_COLORS[relationOf(state, viewerOf(state), e.owner)];
}

function liftOf(e: Entity): number {
  if (e.building) return BUILDINGS[e.building.type].size * 0.9 + 1;
  return e.unit?.type === 'drone' ? 2.6 : 2;
}

/** Small bars over buildings and units (HTML on top of the 3D view). */
export class Bars {
  readonly root = el('div', { class: 'bars' });
  private pool: HTMLElement[] = [];

  constructor(private readonly project: Project) {}

  update(state: GameState, selectedIds: ReadonlySet<number>): void {
    let used = 0;
    for (const e of state.world.with('position')) {
      if (e.zone !== viewerHome(state)) continue;
      const info = barFor(e, state.time, selectedIds.has(e.id));
      const p = info && this.project(e.position.x, e.position.y, liftOf(e));
      if (!info || !p) continue;
      const b = this.bar(used++);
      this.place(b, info, p, e.building ? 56 : 34);
      b.style.borderColor = frameColor(state, e);
    }
    this.pool.forEach((b, i) => {
      if (i >= used) b.hidden = true;
    });
  }

  private bar(i: number): HTMLElement {
    let b = this.pool[i];
    if (!b) {
      b = el('div', { class: 'bar' }, el('i'));
      this.pool.push(b);
      this.root.append(b);
    }
    return b;
  }

  private place(b: HTMLElement, info: BarInfo, p: { x: number; y: number }, width: number): void {
    b.hidden = false;
    b.className = `bar ${info.kind}${info.kind === 'hp' && info.value < 0.35 ? ' low' : ''}`;
    b.style.width = `${width}px`;
    b.style.transform = `translate(${Math.round(p.x - width / 2)}px, ${Math.round(p.y)}px)`;
    (b.firstElementChild as HTMLElement).style.width = `${Math.round(info.value * 100)}%`;
  }
}
