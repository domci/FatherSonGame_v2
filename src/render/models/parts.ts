import {
  BoxGeometry,
  CapsuleGeometry,
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
import { domeGlassMaterial, glassMaterial, solidMaterial } from '../materials';
import { kitModel, remapMaterials, type KitName } from './kit';
import { alienGlow, bone, chitin, flesh, membrane } from './alien-materials';
import { tendril } from './shapes';

export type MaterialName =
  | 'metal'
  | 'dark'
  | 'glass'
  | 'domeGlass'
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
  | 'steel'
  | 'chitin'
  | 'chitinLight'
  | 'flesh'
  | 'fleshDark'
  | 'skinChitin'
  | 'skinFlesh'
  | 'glowGreen'
  | 'glowCyan'
  | 'glowViolet'
  | 'membrane'
  | 'bone'
  | 'shieldBlue';

/** One simple shape of a model. Sizes in tiles. */
export interface Part {
  shape:
    | 'box'
    | 'cyl'
    | 'dome'
    | 'sphere'
    | 'cone'
    | 'torus'
    | 'halfcyl'
    | 'capsule'
    | 'tendril'
    | 'arc';
  /**
   * box: [w, h, d]; cyl/cone: [radius, height]; dome/sphere: [radius]; torus: [radius, tube];
   * capsule: [radius, length]; tendril: [thickness, height, bend]; arc: [radius, tube, angle].
   */
  size: number[];
  pos?: [number, number, number];
  rot?: [number, number, number];
  /** Stretch the shape (blobs, eggs). */
  scale?: [number, number, number];
  mat: MaterialName;
  /** Name for animation (e.g. 'head' turns to the target). */
  name?: string;
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
  name?: string;
}

export type ModelPart = Part | KitPart;

const MATERIALS: Record<MaterialName, () => Material> = {
  metal: () => solidMaterial(0xc9ced6, { metal: 0.8, rough: 0.35 }),
  dark: () => solidMaterial(0x3a4048, { metal: 0.7, rough: 0.5 }),
  glass: () => glassMaterial(),
  domeGlass: () => domeGlassMaterial(),
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
  chitin: () => chitin(),
  chitinLight: () => chitin(0x52356e),
  flesh: () => flesh(),
  fleshDark: () => flesh(0x3a1c33),
  skinChitin: () => chitin(0x52356e, false),
  skinFlesh: () => flesh(0x3a1c33, false),
  glowGreen: () => alienGlow(0x5dff9e),
  glowCyan: () => alienGlow(0x47e8ff),
  glowViolet: () => alienGlow(0xc06bff),
  membrane: () => membrane(),
  bone: () => bone(),
  shieldBlue: () => glassMaterial(0x7fd8ff),
};

type Maker = (a: number, b: number, c: number) => BufferGeometry;

const SHAPES: Record<Part['shape'], Maker> = {
  box: (a, b, c) => new BoxGeometry(a, b, c),
  cyl: (a, b) => new CylinderGeometry(a, a, b, 24),
  cone: (a, b) => new ConeGeometry(a, b, 24),
  dome: (a) => new SphereGeometry(a, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
  sphere: (a) => new SphereGeometry(a, 24, 16),
  torus: (a, b) => new TorusGeometry(a, b, 12, 32),
  halfcyl: (a, b) => new CylinderGeometry(a, a, b, 24, 1, true, 0, Math.PI),
  capsule: (a, b) => new CapsuleGeometry(a, b, 6, 16),
  tendril: (a, b, c) => tendril(a, b, c),
  arc: (a, b, c) => new TorusGeometry(a, b, 10, 24, c),
};

function geometry(p: Part): BufferGeometry {
  const [a = 1, b = 1, c = 1] = p.size;
  return SHAPES[p.shape](a, b, c);
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
  if (p.name) obj.name = p.name;
  return obj;
}

const SEE_THROUGH: readonly MaterialName[] = ['glass', 'domeGlass', 'membrane', 'shieldBlue'];

function shapeMesh(p: Part): Object3D {
  const mesh = new Mesh(geometry(p), MATERIALS[p.mat]());
  mesh.castShadow = !SEE_THROUGH.includes(p.mat);
  mesh.receiveShadow = true;
  if (p.scale) mesh.scale.set(...p.scale);
  if (p.name) mesh.name = p.name;
  return mesh;
}

export function partMaterial(name: MaterialName): Material {
  return MATERIALS[name]();
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
