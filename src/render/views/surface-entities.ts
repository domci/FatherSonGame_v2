import { Group, type Object3D } from 'three/webgpu';
import type { Entity, PlayerId } from '../../sim/entity';
import type { SurfaceMap } from '../../sim/generation/surface';
import type { GameState } from '../../sim/state';
import { BUILDINGS } from '../../content/buildings';
import { factionOf } from '../../sim/names';
import { visualHeight } from '../terrain-shape';
import { makeModel, modelKey, selectionRing } from './entity-models';
import { Animator, type Pose } from '../models/animator';
import { kitAnimations } from '../models/kit';
import { lookOf } from '../models/unit-models';
import { animateSpider } from '../models/spider-model';
import { toWorldX } from './surface-terrain';
import { animateParts } from './building-anim';

interface Shown {
  obj: Object3D;
  key: string;
  animator?: Animator;
}

/** What the player can see on this surface (fog of war). */
export interface Sight {
  visible: Uint8Array;
  explored: Uint8Array;
  /** Owners whose buildings have enough energy. */
  powered: ReadonlySet<PlayerId>;
}

function poseOf(e: Entity): Pose {
  if (e.mover) return 'move';
  if (e.busyWith || e.attacker?.targetId !== undefined) return 'attack';
  return 'idle';
}

function tileOf(map: SurfaceMap, e: Entity): number {
  const p = e.position ?? { x: 0, y: 0 };
  return Math.floor(p.y) * map.size + Math.floor(p.x);
}

/** Own things always; other buildings once explored; other units only when in sight. */
function isShown(map: SurfaceMap, e: Entity, sight: Sight | undefined): boolean {
  if (!sight || e.owner === 'player') return true;
  const tile = tileOf(map, e);
  if (e.building || e.nest) return sight.explored[tile] === 1;
  return sight.visible[tile] === 1;
}

/** Keeps 3D objects in sync with the entities of one surface. */
export class SurfaceEntities {
  readonly group = new Group();
  private shown = new Map<number, Shown>();
  private clock = 0;

  constructor(private map: SurfaceMap) {}

  update(state: GameState, selected: ReadonlySet<number>, dtMs: number, sight?: Sight): void {
    this.clock += dtMs;
    const seen = new Set<number>();
    for (const e of state.world.with('position')) {
      if (
        e.zone !== this.map.bodyId ||
        (e.ship && e.ship.phase !== 'docked' && e.ship.phase !== 'landed')
      )
        continue;
      seen.add(e.id);
      const shown = this.ensure(state, e);
      shown.obj.visible = isShown(this.map, e, sight);
      if (!shown.obj.visible) continue;
      this.place(e, shown.obj, selected.has(e.id), state.time, sight);
      shown.animator?.set(poseOf(e));
      shown.animator?.update(dtMs / 1000);
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
      if (!o.visible) return undefined;
      const id = o.userData.entityId;
      if (typeof id === 'number') return id;
    }
    return undefined;
  }

  /** 3D position of an entity (for effects). */
  objectOf(id: number): Object3D | undefined {
    return this.shown.get(id)?.obj;
  }

  private ensure(state: GameState, e: Entity): Shown {
    const faction = factionOf(state, e.owner);
    const key = modelKey(e, faction);
    const old = this.shown.get(e.id);
    if (old && old.key === key) return old;
    if (old) this.group.remove(old.obj);
    const obj = makeModel(e, faction);
    obj.userData.entityId = e.id;
    obj.userData.alien = faction === 'alien';
    this.group.add(obj);
    const look = e.unit && lookOf(e.unit.type, faction);
    const body = obj.getObjectByName('body');
    const animator =
      look && body ? new Animator(body, kitAnimations(look.kit), look.anims) : undefined;
    const shown = { obj, key, animator };
    this.shown.set(e.id, shown);
    return shown;
  }

  private place(e: Entity, obj: Object3D, selected: boolean, timeMs: number, sight?: Sight): void {
    if (!e.position) return;
    const { x, y } = e.position;
    const t = this.clock / 1000 + e.id;
    const flies = e.unit?.type === 'drone' || (e.unit?.type === 'hunter' && obj.userData.alien);
    const bob = flies ? 0.9 + Math.sin(t * 2.5) * 0.1 : 0;
    obj.position.set(
      toWorldX(this.map, x),
      visualHeight(this.map, x, y) + bob,
      toWorldX(this.map, y),
    );
    if (e.building) this.shapeBuilding(e, obj, timeMs, t, sight);
    if (e.unit) this.animateUnit(e, obj, t);
    this.toggleSelection(obj, selected, e);
  }

  private turnTowards(
    obj: Object3D,
    from: { x: number; y: number },
    to: { x: number; y: number },
  ): void {
    const want = Math.atan2(to.x - from.x, to.y - from.y);
    const diff = want - obj.rotation.y;
    obj.rotation.y += Math.atan2(Math.sin(diff), Math.cos(diff)) * 0.2;
  }

  private animateUnit(e: Entity, obj: Object3D, t: number): void {
    const goal =
      e.mover?.path[0] ?? (e.attacker?.targetId !== undefined ? e.attacker.shot : undefined);
    if (goal && e.position) this.turnTowards(obj, e.position, goal);
    const body = obj.getObjectByName('body');
    if (body && e.unit?.type === 'spider') animateSpider(body, t, e.mover ? 1 : 0.1);
  }

  private shapeBuilding(e: Entity, obj: Object3D, timeMs: number, t: number, sight?: Sight): void {
    if (!e.building) return;
    const body = obj.getObjectByName('body');
    const c = e.construction;
    if (body && c && e.building.level === 0) {
      const p = Math.min(1, (timeMs - c.startedAt) / Math.max(1, c.finishAt - c.startedAt));
      body.scale.set(1, 0.08 + 0.92 * p, 1);
      return;
    }
    const size = BUILDINGS[e.building.type].size;
    const s = size === 1 ? 1 : 1 + (e.building.level - 1) * 0.08;
    obj.scale.set(s, s, s);
    const powered = !e.owner || !sight || sight.powered.has(e.owner);
    if (body) animateParts(body, e, t, powered);
  }

  private toggleSelection(obj: Object3D, selected: boolean, e: Entity): void {
    const ring = obj.getObjectByName('selection');
    if (selected && !ring) {
      const r = selectionRing(e.owner !== 'player');
      r.scale.setScalar(e.building ? BUILDINGS[e.building.type].size * 0.7 : 0.9);
      if (e.unit?.type === 'drone') r.position.y = -1.3;
      obj.add(r);
    } else if (!selected && ring) obj.remove(ring);
    if (ring) ring.rotation.z += 0.02;
  }
}
