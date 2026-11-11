import { Group, type Material, type Object3D } from 'three/webgpu';
import type { Faction } from '../../content/factions';
import type { UnitId } from '../../content/units';
import { ALIEN_KIT } from './alien-materials';
import { kitModelWithHeight, kitModelWithLength, remapMaterials } from './kit';
import { buildModel, partMaterial } from './parts';
import { spiderModel } from './spider-model';
import { UNIT_LOOKS, type UnitLook } from './unit-looks';
import { horns, pod, ribs } from './alien-helpers';

export function lookOf(type: UnitId, faction: Faction): UnitLook | undefined {
  return UNIT_LOOKS[faction][type];
}

/** The living ship of the aliens (no kit model fits). */
function sporeShip(): Group {
  const g = buildModel([
    pod(0, 0, 0.32, 0.5, 'chitin'),
    ...ribs(0, 0, 0.33, [0.15, 0.3]),
    { shape: 'sphere', size: [0.12], pos: [0, 0.32, 0.22], mat: 'glowGreen' },
    ...horns(4, 0.22, 0.35, 'chitinLight', 0.2),
    { shape: 'sphere', size: [0.2], scale: [1, 0.4, 1], pos: [0, 0.02, 0], mat: 'glowGreen' },
  ]);
  g.scale.setScalar(1.3);
  return g;
}

function paint(obj: Object3D, look: UnitLook): void {
  const map: Partial<Record<string, () => Material>> = look.alienPaint ? { ...ALIEN_KIT } : {};
  for (const [from, to] of Object.entries(look.mats ?? {}))
    if (to) map[from] = () => partMaterial(to);
  remapMaterials(obj, map);
}

export function unitModel(type: UnitId, faction: Faction = 'human'): Object3D {
  if (type === 'spider') return spiderModel();
  if (type === 'transport' && faction === 'alien') return sporeShip();
  if (type === 'cruiser' && faction === 'alien') {
    const mother = sporeShip();
    mother.scale.multiplyScalar(1.6);
    return mother;
  }
  const look = lookOf(type, faction);
  const g = new Group();
  if (!look) return g;
  const model = look.length
    ? kitModelWithLength(look.kit, look.length)
    : kitModelWithHeight(look.kit, look.height);
  paint(model, look);
  g.add(model);
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
