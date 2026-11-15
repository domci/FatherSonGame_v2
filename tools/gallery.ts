/**
 * Shows the main models side by side (dev tool, not part of the game).
 * Open /tools/gallery.html in the dev server; tools/models/shots-gallery.mjs saves a picture.
 * Used for before/after pictures when models change (see docs/models.md).
 */
import {
  ACESFilmicToneMapping,
  CircleGeometry,
  DirectionalLight,
  HemisphereLight,
  Mesh,
  PerspectiveCamera,
  Scene,
  WebGPURenderer,
  type Object3D,
} from 'three/webgpu';
import type { BuildingId } from '../src/content/buildings';
import type { Faction } from '../src/content/factions';
import type { UnitId } from '../src/content/units';
import { solidMaterial } from '../src/render/materials';
import { loadKit } from '../src/render/models/kit';
import { buildModel } from '../src/render/models/parts';
import { buildingParts } from '../src/render/models/building-models';
import { eggModel, nestModel, unitModel } from '../src/render/models/unit-models';

const BUILDINGS: BuildingId[] = ['commandDome', 'habitatDome', 'greenhouse', 'lab', 'barracks'];
const UNITS: [UnitId, Faction][] = [
  ['spider', 'human'],
  ['transport', 'alien'],
  ['cruiser', 'alien'],
];

function place(scene: Scene, obj: Object3D, x: number, z: number, scale = 1): void {
  obj.position.set(x, 0, z);
  obj.scale.multiplyScalar(scale);
  scene.add(obj);
}

function fill(scene: Scene): void {
  const factions: Faction[] = ['human', 'alien'];
  factions.forEach((f, row) =>
    BUILDINGS.forEach((id, i) =>
      place(scene, buildModel(buildingParts(id, f)), (i - 2) * 4.2, (row - 1) * 4.4),
    ),
  );
  UNITS.forEach(([id, f], i) => place(scene, unitModel(id, f), (i - 2) * 3, 4.6, 2.2));
  place(scene, eggModel(), 4.2, 4.6, 2.2);
  place(scene, nestModel(), 7.4, 4.6, 1.4);
}

async function main(): Promise<boolean> {
  const canvas = document.getElementById('c') as HTMLCanvasElement;
  const renderer = new WebGPURenderer({ canvas, antialias: true });
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.setClearColor(0x15171c, 1);
  await renderer.init();
  await loadKit();
  const scene = new Scene();
  const sun = new DirectionalLight(0xfff2e0, 3.2);
  sun.position.set(6, 12, 8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14 });
  scene.add(new HemisphereLight(0xcfe0ff, 0x3a3028, 1.4), sun);
  const ground = new Mesh(new CircleGeometry(16, 64), solidMaterial(0x6f6559, { metal: 0, rough: 1 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  fill(scene);
  const camera = new PerspectiveCamera(34, canvas.width / canvas.height, 0.1, 200);
  camera.position.set(0, 15, 17);
  camera.lookAt(0, 0, 0.6);
  await renderer.renderAsync(scene, camera);
  return true;
}

(window as unknown as { galleryReady: Promise<boolean> }).galleryReady = main();
