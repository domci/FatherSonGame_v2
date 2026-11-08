import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  SphereGeometry,
  TorusGeometry,
  type BufferGeometry,
  type Material,
  type Object3D,
} from 'three/webgpu';
import { glassMaterial, solidMaterial } from '../materials';
import { kitModel, remapMaterials, type KitName } from './kit';

export type MaterialName =
  | 'metal'
  | 'dark'
  | 'glass'
  | 'solar'
  | 'glowBlue'
  | 'glowPink'
  | 'glowYellow'
  | 'green'
  | 'orange'
  | 'white'
  | 'window'
  | 'plant'
  | 'red'
  | 'steel';

/** One simple shape of a model. Sizes in tiles. */
export interface Part {
  shape: 'box' | 'cyl' | 'dome' | 'sphere' | 'cone' | 'torus' | 'halfcyl';
  /** box: [w, h, d]; cyl/cone: [radius, height]; dome/sphere: [radius]; torus: [radius, tube]. */
  size: number[];
  pos?: [number, number, number];
  rot?: [number, number, number];
  mat: MaterialName;
}

/** A ready-made model from the kit (see kit.ts). Sizes in tiles. */
export interface KitPart {
  kit: KitName;
  pos?: [number, number, number];
  rot?: [number, number, number];
  /** One number or [x, y, z]. */
  scale?: number | [number, number, number];
  /** Replace kit materials, e.g. { dark: 'glass' }. */
  mats?: Partial<Record<string, MaterialName>>;
}

export type ModelPart = Part | KitPart;

const MATERIALS: Record<MaterialName, () => Material> = {
  metal: () => solidMaterial(0xc9ced6, { metal: 0.8, rough: 0.35 }),
  dark: () => solidMaterial(0x3a4048, { metal: 0.7, rough: 0.5 }),
  glass: () => glassMaterial(),
  solar: () => solidMaterial(0x2a5aa8, { metal: 0.35, rough: 0.3 }),
  glowBlue: () => solidMaterial(0x4fc3ff, { glow: 2.5 }),
  glowPink: () => solidMaterial(0xff5ec4, { glow: 2.5 }),
  glowYellow: () => solidMaterial(0xffd36b, { glow: 2.5 }),
  green: () => solidMaterial(0x4caf50, { metal: 0, rough: 0.8 }),
  orange: () => solidMaterial(0xe8873a, { metal: 0.5, rough: 0.5 }),
  white: () => solidMaterial(0xe8eaee, { metal: 0.3, rough: 0.45 }),
  window: () => solidMaterial(0xffc46b, { glow: 1.8 }),
  plant: () => solidMaterial(0x58d66a, { glow: 0.35, metal: 0, rough: 0.8 }),
  red: () => solidMaterial(0xd8402f, { metal: 0.4, rough: 0.5 }),
  steel: () => solidMaterial(0x7d8794, { metal: 0.9, rough: 0.25 }),
};

function geometry(p: Part): BufferGeometry {
  const [a = 1, b = 1, c = 1] = p.size;
  switch (p.shape) {
    case 'box':
      return new BoxGeometry(a, b, c);
    case 'cyl':
      return new CylinderGeometry(a, a, b, 24);
    case 'cone':
      return new ConeGeometry(a, b, 24);
    case 'dome':
      return new SphereGeometry(a, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    case 'sphere':
      return new SphereGeometry(a, 24, 16);
    case 'torus':
      return new TorusGeometry(a, b, 12, 32);
    case 'halfcyl':
      return new CylinderGeometry(a, a, b, 24, 1, true, 0, Math.PI);
  }
}

function kitMesh(p: KitPart): Object3D {
  const obj = kitModel(p.kit);
  if (p.mats) {
    const map: Partial<Record<string, () => Material>> = {};
    for (const [from, to] of Object.entries(p.mats)) if (to) map[from] = MATERIALS[to];
    remapMaterials(obj, map);
  }
  if (typeof p.scale === 'number') obj.scale.setScalar(p.scale);
  else if (p.scale) obj.scale.set(...p.scale);
  return obj;
}

function shapeMesh(p: Part): Object3D {
  const mesh = new Mesh(geometry(p), MATERIALS[p.mat]());
  mesh.castShadow = p.mat !== 'glass';
  mesh.receiveShadow = true;
  return mesh;
}

export function buildModel(parts: readonly ModelPart[]): Group {
  const group = new Group();
  for (const p of parts) {
    const obj = 'kit' in p ? kitMesh(p) : shapeMesh(p);
    if (p.pos) obj.position.set(...p.pos);
    if (p.rot) obj.rotation.set(...p.rot);
    group.add(obj);
  }
  return group;
}
