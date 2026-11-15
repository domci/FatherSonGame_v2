import { Group, type Material, type Object3D } from 'three/webgpu';
import type { Faction } from '../../content/factions';
import type { UnitId } from '../../content/units';
import { ALIEN_KIT } from './alien-materials';
import {
  kitModel,
  kitModelWithHeight,
  kitModelWithLength,
  isBlender,
  remapMaterials,
  type BlenderName,
} from './kit';
import { KIT_MATERIALS } from './kit-materials';
import { blenderMaterials, partMaterial } from './parts';
import { spiderModel } from './spider-model';
import { UNIT_LOOKS, type UnitLook } from './unit-looks';

export function lookOf(type: UnitId, faction: Faction): UnitLook | undefined {
  return UNIT_LOOKS[faction][type];
}

/** A Blender model with the game's materials. */
function blender(name: BlenderName, scale = 1): Group {
  const g = new Group();
  const model = kitModel(name);
  blenderMaterials(model);
  remapMaterials(model, { rock: KIT_MATERIALS.rockDark });
  model.scale.setScalar(scale);
  g.add(model);
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
  if (type === 'transport' && faction === 'alien') return blender('spore_ship');
  if (type === 'cruiser' && faction === 'alien') return blender('spore_ship', 1.6);
  const look = lookOf(type, faction);
  const g = new Group();
  if (!look) return g;
  const model = look.length
    ? kitModelWithLength(look.kit, look.length)
    : kitModelWithHeight(look.kit, look.height);
  if (isBlender(look.kit)) blenderMaterials(model);
  paint(model, look);
  g.add(model);
  return g;
}

/** A clutch of spider eggs (Blender model 'egg'). */
export function eggModel(): Group {
  return blender('egg');
}

/** A spider nest: rocky crater, web strands, glowing eggs (Blender model 'nest'). */
export function nestModel(): Group {
  return blender('nest');
}
