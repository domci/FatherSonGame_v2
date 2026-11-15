import { Group, type Material, type Object3D } from 'three/webgpu';
import { solidMaterial } from '../materials';
import { kitModel, remapMaterials } from './kit';
import { blenderMaterials } from './parts';

/** The spider keeps its own dark violet look (not the alien chitin with its breathing). */
const SPIDER_MATS: Partial<Record<string, () => Material>> = {
  chitin: () => solidMaterial(0x2b1a3a, { metal: 0.35, rough: 0.32 }),
  chitinLight: () => solidMaterial(0x4a2c5e, { metal: 0.3, rough: 0.4 }),
  glowPink: () => solidMaterial(0xff3fb4, { glow: 3 }),
};

/**
 * Six-eyed spider creature, about 1.2 tiles wide (Blender model 'spider').
 * Legs are pivots named leg0..leg5; their start turn is kept in userData.baseY.
 */
export function spiderModel(): Group {
  const g = new Group();
  const model = kitModel('spider');
  blenderMaterials(model);
  remapMaterials(model, SPIDER_MATS);
  for (let i = 0; i < 6; i++) {
    const l = model.getObjectByName(`leg${i}`);
    if (l) l.userData.baseY = l.rotation.y;
  }
  g.add(model);
  return g;
}

/** Tripod walk: legs swing in two groups of three. */
export function animateSpider(body: Object3D, t: number, walking: number): void {
  for (let i = 0; i < 6; i++) {
    const l = body.getObjectByName(`leg${i}`);
    if (!l) continue;
    const phase = (i % 2 === 0) === (Math.floor(i / 2) % 2 === 0) ? 0 : Math.PI;
    const base = typeof l.userData.baseY === 'number' ? l.userData.baseY : 0;
    l.rotation.y = base + Math.sin(t * 10 + phase) * 0.28 * walking;
    l.rotation.x = Math.max(0, Math.cos(t * 10 + phase)) * 0.18 * walking;
  }
  body.position.y = Math.abs(Math.sin(t * 10)) * 0.03 * walking;
}
