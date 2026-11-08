import {
  AmbientLight,
  Color,
  DirectionalLight,
  Fog,
  HemisphereLight,
  PerspectiveCamera,
  Plane,
  Raycaster,
  Scene,
  Vector3,
  type Vector2,
} from 'three/webgpu';
import { MapControls } from 'three/addons/controls/MapControls.js';
import type { SurfaceMap } from '../../sim/generation/surface';
import type { GameState } from '../../sim/state';
import { createDust, createSky } from './surface-sky';
import { createTerrain } from './surface-terrain';
import { SurfaceEntities } from './surface-entities';
import { Ghost } from './ghost';
import type { Pick, View, ViewUi } from './view';

const MIN_DIST = 6;
const MAX_DIST = 42;
const SUN_DIR = new Vector3(38, 24, 26).normalize();

/** Low sun = long, dramatic shadows. Blue fill light from the sky. */
function createSun(scene: Scene): DirectionalLight {
  const sun = new DirectionalLight(0xfff0dc, 3.6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.03;
  const cam = sun.shadow.camera;
  [cam.left, cam.right, cam.top, cam.bottom, cam.far] = [-28, 28, 28, -28, 200];
  scene.add(
    sun,
    sun.target,
    new HemisphereLight(0x6a80b0, 0x2a2420, 0.55),
    new AmbientLight(0x30384a, 0.35),
  );
  return sun;
}

export class SurfaceView implements View {
  readonly name = 'surface' as const;
  readonly scene = new Scene();
  readonly camera = new PerspectiveCamera(50, 1, 0.1, 2000);
  private controls: MapControls;
  private entities: SurfaceEntities;
  private ghost = new Ghost();
  private ray = new Raycaster();
  private groundPlane = new Plane(new Vector3(0, 1, 0), 0);
  private sun: DirectionalLight;

  constructor(
    private map: SurfaceMap,
    dom: HTMLElement,
  ) {
    this.scene.background = new Color(0x02030a);
    this.scene.fog = new Fog(0x07080d, 55, 130);
    this.scene.add(createSky(), createTerrain(map), createDust(map.size + 30));
    this.sun = createSun(this.scene);
    this.entities = new SurfaceEntities(map);
    this.scene.add(this.entities.group, this.ghost.group);
    this.camera.position.set(4, 15, 17);
    this.controls = new MapControls(this.camera, dom);
    Object.assign(this.controls, {
      enableDamping: true,
      minDistance: MIN_DIST,
      maxDistance: MAX_DIST,
      maxPolarAngle: 1.3,
      screenSpacePanning: false,
    });
  }

  update(state: GameState, ui: ViewUi, dtMs: number): void {
    this.entities.update(state, ui.selectedIds, state.time, dtMs);
    this.ghost.update(this.map, ui.ghost);
    this.controls.update(dtMs / 1000);
    const t = this.controls.target;
    const half = this.map.size / 2;
    t.x = Math.max(-half, Math.min(half, t.x));
    t.z = Math.max(-half, Math.min(half, t.z));
    this.sun.target.position.copy(t);
    this.sun.position.copy(t).addScaledVector(SUN_DIR, 60);
  }

  pick(_state: GameState, ndc: Vector2): Pick | null {
    this.ray.setFromCamera(ndc, this.camera);
    const hits = this.ray.intersectObject(this.entities.group, true);
    const id = this.entities.idOf(hits[0]?.object ?? null);
    if (id !== undefined) return { kind: 'entity', id };
    const p = this.ray.ray.intersectPlane(this.groundPlane, new Vector3());
    if (!p) return null;
    return { kind: 'ground', x: p.x + this.map.size / 2, y: p.z + this.map.size / 2 };
  }

  setEnabled(enabled: boolean): void {
    this.controls.enabled = enabled;
  }

  resize(aspect: number): void {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }

  zoomLevel(): number {
    const d = this.camera.position.distanceTo(this.controls.target);
    return (d - MIN_DIST) / (MAX_DIST - MIN_DIST);
  }

  resetZoom(at: 0 | 1): void {
    const dir = this.camera.position.clone().sub(this.controls.target).normalize();
    const dist = at === 1 ? MAX_DIST * 0.95 : 22;
    this.camera.position.copy(this.controls.target).addScaledVector(dir, dist);
  }
}
