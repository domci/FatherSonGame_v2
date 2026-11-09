import type { Object3D } from 'three/webgpu';
import type { Entity } from '../../sim/entity';

/** Small life in buildings: turret heads aim, cores pulse, force fields flicker without energy. */
export function animateParts(body: Object3D, e: Entity, t: number, powered: boolean): void {
  const head = body.getObjectByName('head');
  const shot = e.attacker?.shot;
  if (head && shot && e.position) {
    const want = Math.atan2(shot.x - e.position.x, shot.y - e.position.y);
    const diff = want - head.rotation.y;
    head.rotation.y += Math.atan2(Math.sin(diff), Math.cos(diff)) * 0.25;
  }
  const core = body.getObjectByName('core');
  if (core) core.scale.setScalar(powered ? 1 + Math.sin(t * 3) * 0.08 : 0.7);
  const ring = body.getObjectByName('ring');
  if (ring && powered) ring.rotation.z = t * 1.5;
  const field = body.getObjectByName('field');
  if (field) field.visible = powered || Math.sin(t * 23) > 0.6;
}
