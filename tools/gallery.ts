/**
 * Shows the main models side by side (dev tool, not part of the game).
 * Open /tools/gallery.html?set=main|units|ships|human|alien in the dev server; tools/models/shots-gallery.mjs saves a picture.
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
import { BUILDING_LIST } from '../src/content/building-list';
import type { Faction } from '../src/content/factions';
import type { UnitId } from '../src/content/units';
import { solidMaterial } from '../src/render/materials';
import { loadKit } from '../src/render/models/kit';
import { buildModel } from '../src/render/models/parts';
import { buildingParts } from '../src/render/models/building-models';
import { eggModel, nestModel, unitModel } from '../src/render/models/unit-models';
import { UNIT_LOOKS } from '../src/render/models/unit-looks';

const BUILDINGS: BuildingId[] = ['commandDome', 'habitatDome', 'greenhouse', 'lab', 'barracks'];
const UNITS = Object.keys(UNIT_LOOKS.human).filter((u) => u !== 'cruiser') as UnitId[];
const SET = new URLSearchParams(location.search).get('set') ?? 'main';

function place(scene: Scene, obj: Object3D, x: number, z: number, scale = 1): void {
  obj.position.set(x, 0, z);
  obj.scale.multiplyScalar(scale);
  scene.add(obj);
}

/** All units of both peoples in two rows (?set=units). */
function fillUnits(scene: Scene): void {
  (['human', 'alien'] as Faction[]).forEach((f, row) => {
    UNITS.forEach((id, i) => place(scene, unitModel(id, f), (i - 4.5) * 2.7, row * 4.2 - 4, 2));
    place(scene, unitModel('cruiser', f), 3, 5.2 + row * 2.8, 1.8);
  });
  place(scene, unitModel('spider'), -9, 6, 2.2);
  place(scene, eggModel(), -6, 6, 2.2);
  place(scene, nestModel(), -2.5, 6, 1.4);
}

const SHIPS: UnitId[] = ['miningShip', 'transport', 'fighter', 'bomber', 'spaceFighter', 'cruiser'];

/** All ships, big (?set=ships). */
function fillShips(scene: Scene): void {
  (['human', 'alien'] as Faction[]).forEach((f, row) =>
    SHIPS.forEach((id, i) =>
      place(scene, unitModel(id, f), (i - 2.5) * 4.6, row * 5.5 - 3, id === 'cruiser' ? 2.6 : 4.5),
    ),
  );
}

/** Every building of one people in a grid (?set=human or ?set=alien). */
function fillBuildings(scene: Scene, f: Faction): void {
  BUILDING_LIST.forEach((def, i) =>
    place(scene, buildModel(buildingParts(def.id, f)), ((i % 6) - 2.5) * 4.6, Math.floor(i / 6) * 4.6 - 7),
  );
}

function fill(scene: Scene): void {
  if (SET === 'human' || SET === 'alien') return fillBuildings(scene, SET);
  if (SET === 'ships') return fillShips(scene);
  if (SET === 'units') return fillUnits(scene);
  const factions: Faction[] = ['human', 'alien'];
  factions.forEach((f, row) =>
    BUILDINGS.forEach((id, i) =>
      place(scene, buildModel(buildingParts(id, f)), (i - 2) * 4.2, (row - 1) * 4.4),
    ),
  );
  const units: [UnitId, Faction][] = [
    ['spider', 'human'],
    ['transport', 'alien'],
    ['cruiser', 'alien'],
  ];
  units.forEach(([id, f], i) => place(scene, unitModel(id, f), (i - 2) * 3, 4.6, 2.2));
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
  Object.assign(sun.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22 });
  scene.add(new HemisphereLight(0xcfe0ff, 0x3a3028, 1.4), sun);
  const ground = new Mesh(new CircleGeometry(40, 64), solidMaterial(0x6f6559, { metal: 0, rough: 1 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  fill(scene);
  const camera = new PerspectiveCamera(34, canvas.width / canvas.height, 0.1, 200);
  const far = SET === 'human' || SET === 'alien';
  camera.position.set(0, far ? 30 : 15, far ? 25 : 17);
  camera.lookAt(0, 0, far ? 1.5 : 0.6);
  await renderer.renderAsync(scene, camera);
  return true;
}

(window as unknown as { galleryReady: Promise<boolean> }).galleryReady = main();
