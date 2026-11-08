import { Group, type Object3D } from 'three/webgpu';
import type { Entity } from '../../sim/entity';
import type { SurfaceMap } from '../../sim/generation/surface';
import type { GameState } from '../../sim/state';
import { BUILDINGS } from '../../content/buildings';
import { visualHeight } from '../terrain-shape';
import { makeModel, modelKey, selectionRing } from './entity-models';
import { Animator, type Pose } from '../models/animator';
import { kitAnimations } from '../models/kit';
import { UNIT_KIT } from '../models/unit-models';
import { animateSpider } from '../models/spider-model';
import { toWorldX } from './surface-terrain';

interface Shown {
  obj: Object3D;
  key: string;
  animator?: Animator;
}

function poseOf(e: Entity): Pose {
  if (e.mover) return 'move';
  if (e.busyWith || e.attacker?.targetId !== undefined) return 'attack';
  return 'idle';
}

/** Keeps 3D objects in sync with the entities of one surface. */
export class SurfaceEntities {
  readonly group = new Group();
  private shown = new Map<number, Shown>();
  private clock = 0;

  constructor(private map: SurfaceMap) {}

  update(state: GameState, selected: ReadonlySet<number>, timeMs: number, dtMs: number): void {
    this.clock += dtMs;
    const seen = new Set<number>();
    for (const e of state.world.with('position')) {
      if (e.zone !== this.map.bodyId || (e.ship && e.ship.phase !== 'docked')) continue;
      seen.add(e.id);
      this.place(e, this.ensure(e), selected.has(e.id), timeMs);
      const anim = this.shown.get(e.id)?.animator;
      anim?.set(poseOf(e));
      anim?.update(dtMs / 1000);
    }
    for (const [id, s] of this.shown) {
      if (seen.has(id)) continue;
      this.group.remove(s.obj);
      this.shown.delete(id);
    }
  }

  /** Finds the entity id for a clicked 3D object. */
  idOf(obj: Object3D | null): number | undefined {
    for (let o = obj; o; o = o.parent) {
      const id = o.userData.entityId;
      if (typeof id === 'number') return id;
    }
    return undefined;
  }

  private ensure(e: Entity): Object3D {
    const key = modelKey(e);
    const old = this.shown.get(e.id);
    if (old && old.key === key) return old.obj;
    if (old) this.group.remove(old.obj);
    const obj = makeModel(e);
    obj.userData.entityId = e.id;
    this.group.add(obj);
    const kit = e.unit && UNIT_KIT[e.unit.type];
    const body = obj.getObjectByName('body');
    const animator = kit && body ? new Animator(body, kitAnimations(kit)) : undefined;
    this.shown.set(e.id, { obj, key, animator });
    return obj;
  }

  private place(e: Entity, obj: Object3D, selected: boolean, timeMs: number): void {
    if (!e.position) return;
    const { x, y } = e.position;
    const t = this.clock / 1000 + e.id;
    const bob = e.unit?.type === 'drone' ? 0.9 + Math.sin(t * 2.5) * 0.1 : 0;
    obj.position.set(
      toWorldX(this.map, x),
      visualHeight(this.map, x, y) + bob,
      toWorldX(this.map, y),
    );
    if (e.building) this.shapeBuilding(e, obj, timeMs);
    if (e.unit) this.animateUnit(e, obj, t);
    this.toggleSelection(obj, selected, e);
  }

  private turnTowardsPath(e: Entity, obj: Object3D): void {
    const target = e.mover?.path[0];
    if (!target || !e.position) return;
    const want = Math.atan2(target.x - e.position.x, target.y - e.position.y);
    const diff = want - obj.rotation.y;
    obj.rotation.y += Math.atan2(Math.sin(diff), Math.cos(diff)) * 0.2;
  }

  private animateUnit(e: Entity, obj: Object3D, t: number): void {
    this.turnTowardsPath(e, obj);
    const body = obj.getObjectByName('body');
    if (!body) return;
    if (e.unit?.type === 'spider') animateSpider(body, t, e.mover ? 1 : 0.1);
  }

  private shapeBuilding(e: Entity, obj: Object3D, timeMs: number): void {
    if (!e.building) return;
    const body = obj.getObjectByName('body');
    const c = e.construction;
    if (body && c && e.building.level === 0) {
      const p = Math.min(1, (timeMs - c.startedAt) / Math.max(1, c.finishAt - c.startedAt));
      body.scale.set(1, 0.08 + 0.92 * p, 1);
      return;
    }
    const s = 1 + (e.building.level - 1) * 0.08;
    obj.scale.set(s, s, s);
  }

  private toggleSelection(obj: Object3D, selected: boolean, e: Entity): void {
    const ring = obj.getObjectByName('selection');
    if (selected && !ring) {
      const r = selectionRing();
      r.scale.setScalar(e.building ? BUILDINGS[e.building.type].size * 0.7 : 0.9);
      if (e.unit?.type === 'drone') r.position.y = -1.3;
      obj.add(r);
    } else if (!selected && ring) obj.remove(ring);
    if (ring) ring.rotation.z += 0.02;
  }
}
