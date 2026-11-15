import {
  Box3,
  Group,
  Mesh,
  Vector3,
  type AnimationClip,
  type Material,
  type Object3D,
} from 'three/webgpu';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js';
import { KIT_MATERIALS, type KitMaterial } from './kit-materials';
import { makeLods } from './lod';

/** Kenney Space Kit parts (CC0). */
export const KENNEY = [
  'hangar_roundGlass',
  'hangar_roundA',
  'hangar_smallA',
  'hangar_smallB',
  'hangar_largeA',
  'craft_cargoA',
  'satelliteDish_large',
  'satelliteDish_detailed',
  'machine_wireless',
  'machine_generator',
  'machine_generatorLarge',
  'machine_barrel',
  'machine_barrelLarge',
  'chimney_detailed',
  'pipe_straight',
  'pipe_ring',
  'barrels',
  'rocks_smallA',
  'rocks_smallB',
  'rock_crystalsLargeA',
  'rock_crystals',
  'structure_detailed',
  'structure_closed',
  'rocket_baseA',
  'rocket_fuelB',
  'rocket_sidesA',
  'rocket_topA',
  'gate_complex',
  'supports_low',
  'corridor_window',
  'rover',
  'turret_double',
  'hangar_largeB',
] as const;

/** Own models, built with Blender scripts (tools/models/, see docs/models.md). */
export const BLENDER = [
  'dome',
  'pod',
  'spider',
  'spore_ship',
  'egg',
  'nest',
  'h_fighter',
  'h_bomber',
  'h_space_fighter',
  'h_transport',
  'h_miner',
  'h_cruiser',
  'a_miner',
  'a_space_fighter',
  'tunnel',
  'vein',
  'pad',
  'mound',
  'mushroom',
  'horn',
  'h_turret',
  'crystals',
  'h_tank',
  'h_infantry',
  'h_drone',
  'h_hunter',
  'h_flak',
  'a_drone',
  'a_hunter',
  'a_infantry',
  'a_tank',
  'a_flak',
  'a_fighter',
  'a_bomber',
] as const;

export type BlenderName = (typeof BLENDER)[number];
export type KitName = (typeof KENNEY)[number] | BlenderName;

export function isBlender(name: string): name is BlenderName {
  return (BLENDER as readonly string[]).includes(name);
}

interface KitEntry {
  scene: Object3D;
  size: Vector3;
  animations: AnimationClip[];
  skinned: boolean;
}

const cache = new Map<KitName, KitEntry>();

function urlOf(name: KitName): string {
  const folder = isBlender(name) ? 'blender' : 'kenney';
  return `${import.meta.env.BASE_URL}models/${folder}/${name}.glb`;
}

/**
 * Centers the model on x/z and puts its lowest point at y = 0.
 * Blender models are already built around their pivot, so they stay as they are.
 */
function normalize(scene: Object3D, keep: boolean): Object3D {
  const box = new Box3().setFromObject(scene);
  const c = box.getCenter(new Vector3());
  const holder = new Group();
  if (!keep) scene.position.set(-c.x, -box.min.y, -c.z);
  holder.add(scene);
  return holder;
}

function prepare(scene: Object3D, kenney: boolean): boolean {
  let skinned = false;
  scene.traverse((o) => {
    if (!(o instanceof Mesh)) return;
    o.castShadow = true;
    o.receiveShadow = true;
    if ('isSkinnedMesh' in o) skinned = true;
    const old = o.material as Material;
    if (kenney) o.material = KIT_MATERIALS[(old.name || 'metal') as KitMaterial]?.() ?? old;
    o.userData.kitMat = old.name;
  });
  return skinned;
}

let loading: Promise<void> | undefined;

/** Loads all kit models once. Call before the 3D views are created. */
export function loadKit(): Promise<void> {
  loading ??= (async () => {
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    const names: KitName[] = [...KENNEY, ...BLENDER];
    await Promise.all(
      names.map(async (name) => {
        const gltf = await loader.loadAsync(urlOf(name));
        const skinned = prepare(gltf.scene, (KENNEY as readonly string[]).includes(name));
        makeLods(gltf.scene);
        const scene = normalize(gltf.scene, isBlender(name));
        const size = new Box3().setFromObject(scene).getSize(new Vector3());
        cache.set(name, { scene, size, animations: gltf.animations, skinned });
      }),
    );
  })();
  return loading;
}

/** A new copy of a kit model. Returns an empty group if the kit is not loaded. */
export function kitModel(name: KitName): Object3D {
  const e = cache.get(name);
  if (!e) return new Group();
  return e.skinned ? cloneSkinned(e.scene) : e.scene.clone();
}

/** A kit model scaled so that it is `height` tiles tall. */
export function kitModelWithHeight(name: KitName, height: number): Object3D {
  const obj = kitModel(name);
  const h = cache.get(name)?.size.y ?? 1;
  obj.scale.setScalar(height / Math.max(0.001, h));
  return obj;
}

/** A kit model scaled so that its longest side on the ground is `length` tiles. */
export function kitModelWithLength(name: KitName, length: number): Object3D {
  const obj = kitModel(name);
  const size = cache.get(name)?.size;
  const l = size ? Math.max(size.x, size.z) : 1;
  obj.scale.setScalar(length / Math.max(0.001, l));
  return obj;
}

export function kitAnimations(name: KitName): AnimationClip[] {
  return cache.get(name)?.animations ?? [];
}

/** Gives meshes of a cloned kit model other materials, by the original material name. */
export function remapMaterials(obj: Object3D, map: Partial<Record<string, () => Material>>): void {
  obj.traverse((o) => {
    if (!(o instanceof Mesh)) return;
    const make = map[o.userData.kitMat as string];
    if (make) o.material = make();
  });
}
