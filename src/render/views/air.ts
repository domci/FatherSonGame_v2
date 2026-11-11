import { CircleGeometry, Mesh, MeshBasicNodeMaterial } from 'three/webgpu';
import type { Entity } from '../../sim/entity';
import { layerOf } from '../../sim/layers';

/** Planes fly this high above the ground (tiles). */
export const AIR_HEIGHT = 2.6;

export function flies(e: Entity): boolean {
  return layerOf(e) === 'air';
}

const SHADOW = new MeshBasicNodeMaterial({
  color: 0x000000,
  transparent: true,
  opacity: 0.35,
  depthWrite: false,
});

/** A soft dark spot on the ground under a plane, so you can see where it is. */
export function shadowBlob(): Mesh {
  const m = new Mesh(new CircleGeometry(0.45, 20), SHADOW);
  m.rotation.x = -Math.PI / 2;
  m.position.y = -AIR_HEIGHT + 0.05;
  m.name = 'shadow';
  return m;
}
