import {
  AmbientLight,
  Color,
  DirectionalLight,
  Group,
  Mesh,
  PerspectiveCamera,
  Raycaster,
  Scene,
  SphereGeometry,
  type Vector2,
} from 'three/webgpu';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { findBody, type SolarSystem } from '../../sim/generation/solar-system';
import type { GameState } from '../../sim/state';
import { createStars } from '../stars';
import { atmosphereMaterial, planetMaterial } from '../space-materials';
import { solidMaterial } from '../materials';
import type { Pick, View, ViewUi } from './view';

const RADIUS = 10;
const MIN_DIST = 13.5;
const MAX_DIST = 42;
/** Where on the planet the base is (latitude, longitude in radians). */
const BASE_LAT = 0.35;
const BASE_LON = 0.4;

function baseLights(): Group {
  const g = new Group();
  for (let i = 0; i < 9; i++) {
    const dot = new Mesh(
      new SphereGeometry(0.05 + (i % 3) * 0.02, 8, 8),
      solidMaterial(0xffd36b, { glow: 3 }),
    );
    dot.position.set(Math.cos(i * 2.4) * 0.35 * (i / 9), 0, Math.sin(i * 2.4) * 0.35 * (i / 9));
    g.add(dot);
  }
  const y = Math.sin(BASE_LAT) * RADIUS;
  const r = Math.cos(BASE_LAT) * RADIUS;
  g.position.set(Math.cos(BASE_LON) * r, y, Math.sin(BASE_LON) * r);
  g.lookAt(0, 0, 0);
  g.rotateX(Math.PI / 2);
  return g;
}

/** The home planet as a big sphere. Zoom in = surface, zoom out = solar system. */
export class PlanetView implements View {
  readonly name = 'planet' as const;
  readonly scene = new Scene();
  readonly camera = new PerspectiveCamera(45, 1, 0.1, 3000);
  private controls: OrbitControls;
  private planet = new Group();
  private ray = new Raycaster();

  constructor(system: SolarSystem, dom: HTMLElement) {
    const body = findBody(system, system.homeBodyId);
    if (!body) throw new Error('home planet missing');
    this.scene.background = new Color(0x010208);
    const sphere = new Mesh(new SphereGeometry(RADIUS, 96, 64), planetMaterial(body, 1.4));
    sphere.userData.bodyId = body.id;
    this.planet.add(sphere, baseLights());
    this.scene.add(
      this.planet,
      new Mesh(new SphereGeometry(RADIUS * 1.06, 64, 48), atmosphereMaterial(0x88b8ff, 0.7)),
    );
    const sun = new DirectionalLight(0xfff1dd, 3);
    sun.position.set(45, 20, -5);
    this.scene.add(sun, new AmbientLight(0x30384a, 0.5), createStars(800));
    this.controls = new OrbitControls(this.camera, dom);
    Object.assign(this.controls, {
      enableDamping: true,
      minDistance: MIN_DIST,
      maxDistance: MAX_DIST,
      enablePan: false,
    });
    this.resetZoom(1);
  }

  update(state: GameState, _ui: ViewUi, dtMs: number): void {
    this.planet.rotation.y = state.time / 600000;
    this.controls.update(dtMs / 1000);
  }

  pick(_state: GameState, ndc: Vector2): Pick | null {
    this.ray.setFromCamera(ndc, this.camera);
    const hit = this.ray.intersectObject(this.planet, true)[0];
    const id = hit?.object.userData.bodyId;
    return typeof id === 'string' ? { kind: 'body', id } : null;
  }

  setEnabled(enabled: boolean): void {
    this.controls.enabled = enabled;
  }

  resize(aspect: number): void {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }

  zoomLevel(): number {
    return (this.camera.position.length() - MIN_DIST) / (MAX_DIST - MIN_DIST);
  }

  resetZoom(at: 0 | 1): void {
    const d = at === 0 ? MIN_DIST + 6 : MAX_DIST * 0.75;
    this.camera.position.set(Math.cos(BASE_LON) * d * 0.8, d * 0.45, Math.sin(BASE_LON) * d * 0.8);
    this.controls.target.set(0, 0, 0);
  }
}
