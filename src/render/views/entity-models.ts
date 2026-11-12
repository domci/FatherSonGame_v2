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
import type { Faction } from '../../content/factions';
import type { UnitId } from '../../content/units';
import type { Entity } from '../../sim/entity';
import { buildModel } from '../models/parts';
import { buildingParts } from '../models/building-models';
import { eggModel, nestModel, unitModel } from '../models/unit-models';
import { solidMaterial } from '../materials';
import { flies, shadowBlob } from './air';

/** Units are drawn a bit bigger than real size, so kids can see and tap them. */
export const UNIT_SCALE: Record<UnitId, number> = {
  drone: 1.7,
  hunter: 1.8,
  infantry: 1.8,
  tank: 2.1,
  spider: 1.5,
  miningShip: 1.4,
  transport: 1.9,
  flakTank: 1.9,
  fighter: 2.2,
  bomber: 2.4,
  spaceFighter: 1.6,
  cruiser: 2.4,
};

export function modelKey(e: Entity, faction: Faction): string {
  if (e.building)
    return `b:${faction}:${e.building.type}:${e.construction && e.building.level === 0 ? 'site' : 'done'}`;
  if (e.unit) return `u:${faction}:${e.unit.type}`;
  return e.egg ? 'egg' : 'nest';
}

/** Hologram frame around a building site (orange for humans, green for aliens). */
function siteFrame(size: number, faction: Faction): Group {
  const hex = faction === 'alien' ? 0x5dff9e : 0xffb300;
  const g = new Group();
  const box = new LineSegments(
    new EdgesGeometry(new BoxGeometry(size * 0.9, 1.6, size * 0.9)),
    new LineBasicNodeMaterial({ color: hex, transparent: true, opacity: 0.9 }),
  );
  box.position.y = 0.8;
  box.name = 'frame';
  const ring = new Mesh(
    new RingGeometry(size * 0.55, size * 0.62, 4, 1, Math.PI / 4),
    solidMaterial(hex, { glow: 1.5 }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.05;
  g.add(box, ring);
  g.name = 'site';
  return g;
}

export function makeModel(e: Entity, faction: Faction): Object3D {
  const holder = new Group();
  if (e.building) {
    const model = buildModel(buildingParts(e.building.type, faction));
    model.name = 'body';
    holder.add(model);
    if (e.construction && e.building.level === 0)
      holder.add(siteFrame(BUILDINGS[e.building.type].size, faction));
    return holder;
  }
  if (e.unit) {
    const m = unitModel(e.unit.type, faction);
    m.scale.setScalar(UNIT_SCALE[e.unit.type]);
    m.name = 'body';
    holder.add(m);
    if (flies(e)) holder.add(shadowBlob());
    return holder;
  }
  const m = e.egg ? eggModel() : nestModel();
  if (e.egg) m.scale.multiplyScalar(1.5);
  return m;
}

/** Ring under a selected thing, in the color of its relation to the player. */
export function selectionRing(color = 0x7cff6b): Mesh {
  const ring = new Mesh(new RingGeometry(0.5, 0.6, 40), solidMaterial(color, { glow: 2 }));
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.06;
  ring.name = 'selection';
  return ring;
}
