import {
  CircleGeometry,
  Group,
  Mesh,
  MeshBasicNodeMaterial,
  SphereGeometry,
  TorusGeometry,
  Vector3,
  type Material,
  type Sprite,
} from 'three/webgpu';
import { color, float, smoothstep, uniform, uv } from 'three/tsl';
import { bodyPosition, type Body, type SolarSystem } from '../../sim/generation/solar-system';
import { atmosphereMaterial, planetMaterial, REGOLITH } from '../space-materials';
import { solidMaterial } from '../materials';
import type { Faction } from '../../content/factions';
import { textLabel } from './labels';

/** Where a base sits on its planet (latitude, longitude in radians, planet frame). */
interface BaseSpot {
  lat: number;
  lon: number;
}

const LIGHTS: Record<Faction, number> = { human: 0xffd36b, alien: 0x6dff7a };

/** The base looks at the sun a bit from the side: morning light like on the surface. */
const SUN_OFFSET = 0.9;

/** Small lights of a base, seen from space. */
function baseLights(r: number, hex: number): Group {
  const g = new Group();
  const mat = solidMaterial(hex, { glow: 1.6 });
  g.add(landingSite(r));
  for (let i = 0; i < 30; i++) {
    const a = i * 2.4;
    const d = 0.005 * r * Math.sqrt(i / 30);
    const dot = new Mesh(new SphereGeometry(r * (0.00014 + (i % 3) * 0.00006), 8, 6), mat);
    dot.position.set(Math.cos(a) * d, 0, Math.sin(a) * d);
    g.add(dot);
  }
  return g;
}

/** The flat, light ground around a base (like the landing site on the surface). */
function landingSite(r: number): Mesh {
  const m = new MeshBasicNodeMaterial({ transparent: true, depthWrite: false });
  const d = uv().sub(0.5).length().mul(2);
  m.colorNode = color(0x8f8579);
  m.opacityNode = float(1)
    .sub(smoothstep(0.45, 1, d))
    .mul(0.55);
  const disc = new Mesh(new CircleGeometry(r * 0.011, 48), m);
  disc.rotation.x = -Math.PI / 2;
  disc.position.y = -r * 0.0003;
  return disc;
}

function spotVector(spot: BaseSpot): Vector3 {
  const c = Math.cos(spot.lat);
  return new Vector3(Math.cos(spot.lon) * c, Math.sin(spot.lat), Math.sin(spot.lon) * c);
}

/** One planet in space: sphere, glow, name, and the bases on it. */
export class SpaceBody {
  readonly group = new Group();
  readonly sphere: Mesh;
  readonly label: Sprite;
  private ring?: Mesh;
  private enemyLights?: Group;
  private spot?: BaseSpot;
  /** Close-up detail 0..1; the expensive material is only used while it is above 0. */
  private detail = uniform(0);
  private far: Material;
  private near: Material;

  constructor(
    readonly body: Body,
    kind: 'home' | 'enemy' | 'other',
    private faction: Faction = 'human',
  ) {
    const r = body.radius;
    const ground = kind === 'other' ? undefined : REGOLITH;
    this.far = planetMaterial(body, r, undefined, ground);
    this.near = planetMaterial(body, r, this.detail, ground);
    this.sphere = new Mesh(new SphereGeometry(r, 128, 96), this.far);
    this.sphere.userData.bodyId = body.id;
    const glow = new Mesh(
      new SphereGeometry(r * 1.12, 48, 32),
      atmosphereMaterial(body.kind === 'gas' ? body.color : 0x88b8ff, 0.8),
    );
    this.label = textLabel(kind === 'home' ? `${body.name} (Heimat)` : body.name);
    this.label.position.y = r * 1.25;
    this.group.add(this.sphere, glow, this.label);
    if (kind === 'home') this.addHome(r);
    if (kind === 'enemy') this.addEnemy(r);
  }

  /** Has a base that the camera can look at (and a surface below it). */
  get hasBase(): boolean {
    return !!this.spot;
  }

  /** Moves along the orbit. The planet always shows the same side to the sun. */
  update(timeMs: number, showEnemy: boolean, closeUp: boolean, detail = 0): void {
    this.detail.value = detail;
    this.sphere.material = detail > 0 ? this.near : this.far;
    const p = bodyPosition(this.body, timeMs);
    this.group.position.set(p.x, 0, p.y);
    const toSun = Math.atan2(-p.y, -p.x);
    const lon = this.spot?.lon ?? 0;
    this.sphere.rotation.y = lon - toSun - SUN_OFFSET;
    if (this.enemyLights) this.enemyLights.visible = showEnemy;
    this.label.visible = !closeUp;
    if (this.ring) this.ring.visible = !closeUp;
  }

  /** Unit vector from the planet center to the base (world space). */
  baseNormal(out = new Vector3()): Vector3 {
    if (!this.spot) return out.set(0, 1, 0);
    return out.copy(spotVector(this.spot)).applyEuler(this.sphere.rotation);
  }

  private placeLights(lights: Group, r: number): void {
    const n = spotVector(this.spot ?? { lat: 0, lon: 0 });
    lights.position.copy(n).multiplyScalar(r * 1.0005);
    lights.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), n);
    this.sphere.add(lights);
  }

  private addHome(r: number): void {
    this.spot = { lat: 0.35, lon: 0.4 };
    this.placeLights(baseLights(r, LIGHTS[this.faction]), r);
    this.ring = new Mesh(
      new TorusGeometry(r * 1.6, 0.06, 8, 64),
      solidMaterial(0x7cff6b, { glow: 2 }),
    );
    this.ring.rotation.x = Math.PI / 2;
    this.group.add(this.ring);
  }

  private addEnemy(r: number): void {
    this.spot = { lat: -0.3, lon: 2.2 };
    this.enemyLights = baseLights(r, LIGHTS[this.faction === 'human' ? 'alien' : 'human']);
    this.placeLights(this.enemyLights, r);
  }
}

export function spaceBodies(system: SolarSystem, faction: Faction): Map<string, SpaceBody> {
  const out = new Map<string, SpaceBody>();
  for (const b of system.bodies) {
    const kind =
      b.id === system.homeBodyId ? 'home' : b.id === system.alienBodyId ? 'enemy' : 'other';
    out.set(b.id, new SpaceBody(b, kind, faction));
  }
  return out;
}
