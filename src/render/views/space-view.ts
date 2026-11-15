import { viewerOf } from '../../sim/viewer';
import {
  AmbientLight,
  Color,
  DoubleSide,
  Mesh,
  MeshBasicNodeMaterial,
  PerspectiveCamera,
  PointLight,
  Raycaster,
  RingGeometry,
  Scene,
  Vector3,
  type Object3D,
  type Vector2,
} from 'three/webgpu';
import { BELT_ID, type SolarSystem } from '../../sim/generation/solar-system';
import type { GameState } from '../../sim/state';
import { knowsBase } from '../../sim/visibility';
import { createStars } from '../stars';
import {
  baseToCenter,
  closeDetail,
  planetAltitude,
  planetToSun,
  systemDistance,
  turnToBase,
} from '../zoom';
import { beltObject, orbitLine, selectionMarker, sunObject } from './system-objects';
import type { SpaceBody } from './space-bodies';
import { homesKey, refreshBody } from './space-homes';
import { SpaceOrbit } from './space-orbit';
import { SpaceShips } from './space-ships';
import { SpaceFleet } from './space-fleet';
import type { Pick, View, ViewUi } from './view';

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

const tmp = { a: new Vector3(), b: new Vector3(), c: new Vector3() };

/**
 * Space: the solar system and every planet up close, in one scene.
 * The zoom value (see zoom.ts) moves the camera from just above a base to the whole system.
 */
export class SpaceView implements View {
  readonly name = 'system' as const;
  readonly scene = new Scene();
  readonly camera = new PerspectiveCamera(50, 1, 0.01, 6000);
  readonly orbit: SpaceOrbit;
  private bodies = new Map<string, SpaceBody>();
  private homesKey = '';
  private orbits = new Set<number>();
  private ships = new SpaceShips();
  private fleet: SpaceFleet;
  private belt: Object3D;
  private marker = selectionMarker();
  private pickables: Object3D[] = [];
  private ray = new Raycaster();
  private z = 2.75;
  private focusId: string;
  /** What the camera looks at (follows a new planet smoothly). */
  private look = new Vector3();

  constructor(state: GameState, dom: HTMLElement) {
    const system = state.system;
    this.focusId = system.homeBodyId;
    this.scene.background = new Color(0x010208);
    this.scene.add(createStars(3000, 5000), sunObject(system.sunRadius));
    this.scene.add(new AmbientLight(0x303848, 0.5), new PointLight(0xfff0dd, 4, 0, 0));
    this.syncBodies(state);
    this.belt = beltObject(system);
    const picker = beltPicker(system);
    this.pickables.push(picker);
    this.fleet = new SpaceFleet(this.bodies);
    this.scene.add(this.belt, picker, this.ships.group, this.fleet.group, this.marker);
    this.orbit = new SpaceOrbit(dom);
  }

  /** Where the camera is: zoom value and the planet it flies to. */
  setZoom(z: number, focusId: string): void {
    this.z = z;
    this.focusId = focusId;
  }

  /** Planets: new ones (a growing online world), and new looks when people come or go. */
  private syncBodies(state: GameState): void {
    const key = homesKey(state);
    if (key === this.homesKey) return;
    this.homesKey = key;
    for (const body of state.system.bodies) {
      const old = this.bodies.get(body.id);
      const made = refreshBody(state, body, old);
      if (!made) continue;
      if (old) {
        this.scene.remove(old.group);
        this.pickables = this.pickables.filter((p) => p !== old.sphere);
      }
      if (!this.orbits.has(body.orbitRadius)) {
        this.orbits.add(body.orbitRadius);
        this.scene.add(orbitLine(body.orbitRadius));
      }
      this.bodies.set(body.id, made);
      this.scene.add(made.group);
      this.pickables.push(made.sphere);
    }
  }

  update(state: GameState, ui: ViewUi, dtMs: number): void {
    this.syncBodies(state);
    const gone = new Set(
      Object.values(state.players)
        .filter((p) => p?.defeated)
        .map((p) => p?.homeBodyId),
    );
    for (const b of this.bodies.values()) {
      const focus = b.body.id === this.focusId;
      const known = knowsBase(state, viewerOf(state), b.body.id);
      b.alive = !gone.has(b.body.id);
      b.update(state.time, known, focus && this.z < 2.15, focus ? closeDetail(this.z) : 0);
    }
    this.belt.rotation.y = -state.time / 400000;
    this.ships.update(state);
    this.fleet.update(state, dtMs);
    this.updateMarker(ui.selectedBodyId);
    this.placeCamera(dtMs);
  }

  /** Puts the camera from the zoom value; near the ground it turns to the base. */
  private placeCamera(dtMs: number): void {
    const focus = this.bodies.get(this.focusId);
    if (!focus) return;
    const r = focus.body.radius;
    const center = focus.group.position;
    const normal = focus.baseNormal(tmp.a);
    const turn = focus.hasBase ? turnToBase(this.z) : 0;
    if (turn > 0) {
      const dir = this.orbit.direction(tmp.b);
      const k = turn >= 1 ? 1 : 1 - Math.exp((-dtMs / 1000) * 5 * turn);
      this.orbit.setDirection(dir.lerp(normal, k));
    }
    this.orbit.maxPhi = Math.PI - 0.06 - (Math.PI - 1.5) * planetToSun(this.z);
    const dir = this.orbit.direction(tmp.b);
    const target = tmp.c;
    if (this.z <= 2) {
      const base = normal.multiplyScalar(focus.hasBase ? r : 0).add(center);
      target.copy(base).lerp(center, baseToCenter(this.z));
      this.camera.position.copy(center).addScaledVector(dir, r * (1 + planetAltitude(this.z)));
      this.look.copy(target);
    } else {
      target.copy(center).multiplyScalar(1 - planetToSun(this.z));
      this.look.lerp(target, 1 - Math.exp((-dtMs / 1000) * 6));
      this.camera.position.copy(this.look).addScaledVector(dir, systemDistance(this.z, r));
    }
    this.camera.lookAt(this.look);
    this.updateNear(r);
  }

  /** A close camera needs a small near plane (else the ground is cut away). */
  private updateNear(r: number): void {
    const height = r * planetAltitude(Math.min(2, this.z));
    const near = Math.min(0.5, Math.max(0.0005, height * 0.15));
    if (Math.abs(near - this.camera.near) / near > 0.05) {
      this.camera.near = near;
      this.camera.updateProjectionMatrix();
    }
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
    this.orbit.enabled = enabled;
  }

  resize(aspect: number): void {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }

  private updateMarker(bodyId: string | undefined): void {
    const b = bodyId ? this.bodies.get(bodyId) : undefined;
    this.marker.visible = !!b && this.z > 2.1;
    if (b) {
      this.marker.position.copy(b.group.position);
      this.marker.scale.setScalar(b.body.radius * 2);
    }
  }
}
