import { Group, Mesh, RingGeometry, type Object3D } from 'three/webgpu';
import type { Entity } from '../../sim/entity';
import { surfaceHeight, type SurfaceMap } from '../../sim/generation/surface';
import type { GameState } from '../../sim/state';
import { BUILDINGS } from '../../content/buildings';
import { buildModel } from '../models/parts';
import { HUMAN_BUILDINGS } from '../models/building-specs';
import { eggModel, nestModel, unitModel } from '../models/unit-models';
import { solidMaterial } from '../materials';
import { toWorldX } from './surface-terrain';

interface Shown {
  obj: Object3D;
  key: string;
}

function modelKey(e: Entity): string {
  if (e.building) return `b:${e.building.type}:${e.construction ? 'site' : 'done'}`;
  if (e.unit) return `u:${e.unit.type}`;
  return e.egg ? 'egg' : 'nest';
}

function makeModel(e: Entity): Object3D {
  if (e.building) {
    const model = buildModel(HUMAN_BUILDINGS[e.building.type]);
    if (e.construction) model.add(siteRing(BUILDINGS[e.building.type].size));
    return model;
  }
  if (e.unit) return unitModel(e.unit.type);
  return e.egg ? eggModel() : nestModel();
}

function siteRing(size: number): Mesh {
  const ring = new Mesh(
    new RingGeometry(size * 0.55, size * 0.62, 4, 1, Math.PI / 4),
    solidMaterial(0xffb300, { glow: 1.5 }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.05;
  return ring;
}

function selectionRing(): Mesh {
  const ring = new Mesh(new RingGeometry(0.5, 0.6, 32), solidMaterial(0x7cff6b, { glow: 2 }));
  ring.rotation.x = -Math.PI / 2;
  ring.name = 'selection';
  return ring;
}

/** Keeps 3D objects in sync with the entities of one surface. */
export class SurfaceEntities {
  readonly group = new Group();
  private shown = new Map<number, Shown>();

  constructor(private map: SurfaceMap) {}

  update(state: GameState, selected: ReadonlySet<number>, timeMs: number): void {
    const seen = new Set<number>();
    for (const e of state.world.with('position')) {
      if (e.zone !== this.map.bodyId || (e.ship && e.ship.phase !== 'docked')) continue;
      seen.add(e.id);
      this.place(e, this.ensure(e), selected.has(e.id), timeMs);
    }
    for (const [id, s] of this.shown) {
      if (!seen.has(id)) {
        this.group.remove(s.obj);
        this.shown.delete(id);
      }
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
    this.shown.set(e.id, { obj, key });
    return obj;
  }

  private place(e: Entity, obj: Object3D, selected: boolean, timeMs: number): void {
    if (!e.position) return;
    const { x, y } = e.position;
    const flying = e.unit?.type === 'drone';
    const bob = flying ? 1.2 + Math.sin(timeMs / 300 + e.id) * 0.1 : 0;
    obj.position.set(
      toWorldX(this.map, x),
      surfaceHeight(this.map, x, y) + bob,
      toWorldX(this.map, y),
    );
    if (e.building) this.shapeBuilding(e, obj, timeMs);
    if (e.mover?.path[0]) {
      const t = e.mover.path[0];
      obj.rotation.y = Math.atan2(t.x - x, t.y - y);
    }
    this.toggleSelection(obj, selected, e);
  }

  private shapeBuilding(e: Entity, obj: Object3D, timeMs: number): void {
    if (!e.building) return;
    const c = e.construction;
    if (c && e.building.level === 0) {
      const p = Math.min(1, (timeMs - c.startedAt) / Math.max(1, c.finishAt - c.startedAt));
      obj.scale.set(1, 0.15 + 0.85 * p, 1);
      return;
    }
    const s = 1 + (e.building.level - 1) * 0.08;
    obj.scale.set(s, s, s);
  }

  private toggleSelection(obj: Object3D, selected: boolean, e: Entity): void {
    const ring = obj.getObjectByName('selection');
    if (selected && !ring) {
      const r = selectionRing();
      const size = e.building ? BUILDINGS[e.building.type].size * 0.6 : 0.6;
      r.scale.setScalar(size);
      if (e.unit?.type === 'drone') r.position.y = -1.1;
      obj.add(r);
    } else if (!selected && ring) obj.remove(ring);
  }
}
