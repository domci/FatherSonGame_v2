import { Group, type Object3D } from 'three/webgpu';
import type { UnitId } from '../../content/units';
import { kitModel, kitModelWithHeight, type KitName } from './kit';
import { buildModel } from './parts';
import { spiderModel } from './spider-model';

/** Which kit model (with animations) each unit uses. */
export const UNIT_KIT: Partial<Record<UnitId, KitName>> = {
  drone: 'robot_flyer',
  hunter: 'robot_gunner',
};

const HEIGHT: Partial<Record<UnitId, number>> = { drone: 0.55, hunter: 0.75 };

export function unitModel(type: UnitId): Object3D {
  if (type === 'spider') return spiderModel();
  if (type === 'miningShip') {
    const g = new Group();
    const ship = kitModel('craft_miner');
    ship.scale.setScalar(0.42);
    g.add(ship);
    return g;
  }
  const kit = UNIT_KIT[type];
  const g = new Group();
  if (kit) g.add(kitModelWithHeight(kit, HEIGHT[type] ?? 0.6));
  return g;
}

export function eggModel(): Group {
  const g = buildModel([
    { shape: 'sphere', size: [0.18], pos: [0, 0.18, 0], mat: 'glowPink' },
    { shape: 'sphere', size: [0.1], pos: [0.2, 0.1, 0.08], mat: 'glowPink' },
  ]);
  g.scale.set(1, 1.3, 1);
  return g;
}

export function nestModel(): Group {
  return buildModel([
    { kit: 'rocks_smallB', scale: 2.2, mats: { rock: 'dark', rockTrack: 'dark' } },
    { shape: 'dome', size: [0.9], mat: 'dark' },
    { shape: 'sphere', size: [0.22], pos: [0, 0.25, 0.8], mat: 'glowPink' },
    { shape: 'sphere', size: [0.1], pos: [0.5, 0.15, 0.6], mat: 'glowPink' },
  ]);
}
