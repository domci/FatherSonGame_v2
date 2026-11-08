import {
  BoxGeometry,
  EdgesGeometry,
  Group,
  LineBasicNodeMaterial,
  LineSegments,
  Mesh,
  RingGeometry,
  type Object3D,
} from 'three/webgpu';
import { BUILDINGS } from '../../content/buildings';
import type { UnitId } from '../../content/units';
import type { Entity } from '../../sim/entity';
import { buildModel } from '../models/parts';
import { HUMAN_BUILDINGS } from '../models/building-specs';
import { eggModel, nestModel, unitModel } from '../models/unit-models';
import { solidMaterial } from '../materials';

/** Units are drawn a bit bigger than real size, so kids can see and tap them. */
export const UNIT_SCALE: Record<UnitId, number> = {
  drone: 1.7,
  hunter: 1.8,
  spider: 2,
  miningShip: 1.4,
};

export function modelKey(e: Entity): string {
  if (e.building)
    return `b:${e.building.type}:${e.construction && e.building.level === 0 ? 'site' : 'done'}`;
  if (e.unit) return `u:${e.unit.type}`;
  return e.egg ? 'egg' : 'nest';
}

/** Orange hologram frame around a building site. */
function siteFrame(size: number): Group {
  const g = new Group();
  const box = new LineSegments(
    new EdgesGeometry(new BoxGeometry(size * 0.9, 1.6, size * 0.9)),
    new LineBasicNodeMaterial({ color: 0xffb300, transparent: true, opacity: 0.9 }),
  );
  box.position.y = 0.8;
  box.name = 'frame';
  const ring = new Mesh(
    new RingGeometry(size * 0.55, size * 0.62, 4, 1, Math.PI / 4),
    solidMaterial(0xffb300, { glow: 1.5 }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.05;
  g.add(box, ring);
  g.name = 'site';
  return g;
}

export function makeModel(e: Entity): Object3D {
  if (e.building) {
    const holder = new Group();
    const model = buildModel(HUMAN_BUILDINGS[e.building.type]);
    model.name = 'body';
    holder.add(model);
    if (e.construction && e.building.level === 0)
      holder.add(siteFrame(BUILDINGS[e.building.type].size));
    return holder;
  }
  if (e.unit) {
    const m = unitModel(e.unit.type);
    m.scale.setScalar(UNIT_SCALE[e.unit.type]);
    const holder = new Group();
    holder.add(m);
    m.name = 'body';
    return holder;
  }
  const m = e.egg ? eggModel() : nestModel();
  if (e.egg) m.scale.multiplyScalar(1.5);
  return m;
}

export function selectionRing(): Mesh {
  const ring = new Mesh(new RingGeometry(0.5, 0.6, 40), solidMaterial(0x7cff6b, { glow: 2 }));
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.06;
  ring.name = 'selection';
  return ring;
}
