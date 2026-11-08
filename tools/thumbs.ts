/**
 * Renders a picture of every building for the build bar (dev tool, not part of the game).
 * Open /tools/thumbs.html in the dev server; tools/make-thumbs.mjs saves the pictures.
 */
import {
  ACESFilmicToneMapping,
  Box3,
  DirectionalLight,
  HemisphereLight,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGPURenderer,
} from 'three/webgpu';
import { BUILDING_LIST } from '../src/content/building-list';
import { loadKit } from '../src/render/models/kit';
import { buildModel } from '../src/render/models/parts';
import { HUMAN_BUILDINGS } from '../src/render/models/building-specs';

async function main(): Promise<Record<string, string>> {
  const canvas = document.getElementById('c') as HTMLCanvasElement;
  const renderer = new WebGPURenderer({ canvas, antialias: true, alpha: true });
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.setClearColor(0x000000, 0);
  await renderer.init();
  await loadKit();
  const out: Record<string, string> = {};
  for (const def of BUILDING_LIST) {
    const scene = new Scene();
    const sun = new DirectionalLight(0xfff2e0, 3.2);
    sun.position.set(4, 8, 6);
    scene.add(new HemisphereLight(0xcfe0ff, 0x3a3028, 1.6), sun);
    const model = buildModel(HUMAN_BUILDINGS[def.id]);
    scene.add(model);
    const box = new Box3().setFromObject(model);
    const center = box.getCenter(new Vector3());
    const radius = box.getSize(new Vector3()).length() / 2;
    const camera = new PerspectiveCamera(30, canvas.width / canvas.height, 0.1, 100);
    const dir = new Vector3(1, 0.85, 1.2).normalize();
    camera.position.copy(center).addScaledVector(dir, radius / Math.sin((15 * Math.PI) / 180));
    camera.lookAt(center);
    await renderer.renderAsync(scene, camera);
    out[def.id] = canvas.toDataURL('image/png');
  }
  return out;
}

(window as unknown as { thumbs: Promise<Record<string, string>> }).thumbs = main();
