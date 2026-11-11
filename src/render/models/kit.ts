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

/** Kenney Space Kit parts (CC0). */
export const KENNEY = [
  'platform_large',
  'hangar_roundGlass',
  'hangar_roundA',
  'hangar_smallA',
  'hangar_smallB',
  'hangar_largeA',
  'craft_cargoA',
  'craft_miner',
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
  'turret_single',
  'rocket_baseA',
  'rocket_fuelB',
  'rocket_sidesA',
  'rocket_topA',
  'gate_complex',
  'supports_low',
  'corridor_window',
  'rover',
  'cargo_ship',
  'speeder_c',
  'turret_double',
  'craft_speederA',
  'craft_speederB',
  'craft_speederD',
  'craft_cargoB',
  'hangar_largeB',
] as const;

/** Animated robots by Quaternius (CC0). */
export const QUATERNIUS = [
  'robot_flyer',
  'robot_gunner',
  'astronaut',
  'tank',
  'alien_big',
  'crab',
  'jelly_flyer',
  'armored_bee',
  'wyvern',
  'bat',
  'mech',
  'mech_heavy',
] as const;

export type KitName = (typeof KENNEY)[number] | (typeof QUATERNIUS)[number];

interface KitEntry {
  scene: Object3D;
  size: Vector3;
  animations: AnimationClip[];
  skinned: boolean;
}

const cache = new Map<KitName, KitEntry>();

function urlOf(name: KitName): string {
  const folder = (QUATERNIUS as readonly string[]).includes(name) ? 'quaternius' : 'kenney';
  return `${import.meta.env.BASE_URL}models/${folder}/${name}.glb`;
}

/** Centers the model on x/z and puts its lowest point at y = 0. */
function normalize(scene: Object3D): Object3D {
  const box = new Box3().setFromObject(scene);
  const c = box.getCenter(new Vector3());
  const holder = new Group();
  scene.position.set(-c.x, -box.min.y, -c.z);
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
    const names: KitName[] = [...KENNEY, ...QUATERNIUS];
    await Promise.all(
      names.map(async (name) => {
        const gltf = await loader.loadAsync(urlOf(name));
        const skinned = prepare(gltf.scene, (KENNEY as readonly string[]).includes(name));
        const scene = normalize(gltf.scene);
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
