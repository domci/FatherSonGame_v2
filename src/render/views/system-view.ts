import {
  AmbientLight,
  Color,
  Group,
  Mesh,
  MeshBasicNodeMaterial,
  PerspectiveCamera,
  PointLight,
  Raycaster,
  RingGeometry,
  Scene,
  DoubleSide,
  type Object3D,
  type Vector2,
} from 'three/webgpu';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { BELT_ID, bodyPosition, type SolarSystem } from '../../sim/generation/solar-system';
import type { GameState } from '../../sim/state';
import { unitModel } from '../models/unit-models';
import { createStars } from '../stars';
import { beltObject, orbitLine, planetObject, selectionMarker, sunObject } from './system-objects';
import { shipPose } from './ship-path';
import type { Pick, View, ViewUi } from './view';

const MIN_DIST = 25;
const MAX_DIST = 170;

function beltPicker(system: SolarSystem): Mesh {
  const geo = new RingGeometry(system.belt.inner, system.belt.outer, 64);
  const m = new Mesh(
    geo,
    new MeshBasicNodeMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: DoubleSide,
    }),
  );
  m.rotation.x = -Math.PI / 2;
  m.userData.bodyId = BELT_ID;
  return m;
}

export class SystemView implements View {
  readonly name = 'system' as const;
  readonly scene = new Scene();
  readonly camera = new PerspectiveCamera(50, 1, 0.1, 5000);
  private controls: OrbitControls;
  private planets = new Map<string, Group>();
  private ships = new Map<number, Object3D>();
  private shipGroup = new Group();
  private belt: Object3D;
  private marker = selectionMarker();
  private pickables: Object3D[] = [];
  private ray = new Raycaster();

  constructor(
    private system: SolarSystem,
    dom: HTMLElement,
  ) {
    this.scene.background = new Color(0x010208);
    this.scene.add(
      createStars(1500, 5000),
      sunObject(system.sunRadius),
      new AmbientLight(0x303848, 0.6),
    );
    this.scene.add(new PointLight(0xfff0dd, 4, 0, 0));
    for (const body of system.bodies) {
      const obj = planetObject(body, body.id === system.homeBodyId);
      this.planets.set(body.id, obj);
      this.scene.add(obj, orbitLine(body.orbitRadius));
      this.pickables.push(obj);
    }
    this.belt = beltObject(system);
    const picker = beltPicker(system);
    this.pickables.push(picker);
    this.scene.add(this.belt, picker, this.shipGroup, this.marker);
    this.camera.position.set(0, 70, 85);
    this.controls = new OrbitControls(this.camera, dom);
    Object.assign(this.controls, {
      enableDamping: true,
      minDistance: MIN_DIST,
      maxDistance: MAX_DIST,
      maxPolarAngle: 1.45,
    });
  }

  update(state: GameState, ui: ViewUi, dtMs: number): void {
    for (const body of this.system.bodies) {
      const p = bodyPosition(body, state.time);
      const obj = this.planets.get(body.id);
      obj?.position.set(p.x, 0, p.y);
      if (obj) obj.rotation.y = state.time / 20000;
    }
    this.belt.rotation.y = -state.time / 400000;
    this.updateShips(state);
    this.updateMarker(ui.selectedBodyId);
    this.controls.update(dtMs / 1000);
  }

  pick(_state: GameState, ndc: Vector2): Pick | null {
    this.ray.setFromCamera(ndc, this.camera);
    for (const hit of this.ray.intersectObjects(this.pickables, true)) {
      const id = hit.object.userData.bodyId;
      if (typeof id === 'string') return { kind: 'body', id };
    }
    return null;
  }

  setEnabled(enabled: boolean): void {
    this.controls.enabled = enabled;
  }

  resize(aspect: number): void {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }

  zoomLevel(): number {
    return (
      (this.camera.position.distanceTo(this.controls.target) - MIN_DIST) / (MAX_DIST - MIN_DIST)
    );
  }

  resetZoom(at: 0 | 1): void {
    this.controls.target.set(0, 0, 0);
    const dist = at === 0 ? MIN_DIST * 1.6 : 110;
    this.camera.position.set(0, dist * 0.65, dist * 0.76);
  }

  private updateShips(state: GameState): void {
    const seen = new Set<number>();
    for (const ship of state.world.with('ship')) {
      const pose = shipPose(state, ship);
      if (!pose) continue;
      seen.add(ship.id);
      let obj = this.ships.get(ship.id);
      if (!obj) {
        obj = unitModel('miningShip');
        this.ships.set(ship.id, obj);
        this.shipGroup.add(obj);
      }
      obj.position.set(pose.x, 0.8, pose.y);
      obj.rotation.y = pose.angle;
    }
    for (const [id, obj] of this.ships) {
      if (seen.has(id)) continue;
      this.shipGroup.remove(obj);
      this.ships.delete(id);
    }
  }

  private updateMarker(bodyId: string | undefined): void {
    const planet = bodyId ? this.planets.get(bodyId) : undefined;
    const body = this.system.bodies.find((b) => b.id === bodyId);
    this.marker.visible = !!planet && !!body;
    if (planet && body) {
      this.marker.position.copy(planet.position);
      this.marker.scale.setScalar(body.radius * 2);
    }
  }
}
