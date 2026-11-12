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
import { aiFaction, SIDE_COLORS } from '../../content/sides';
import { AI_IDS } from '../../sim/entity';
import { sideName } from '../../sim/setup';
import { textLabel } from './labels';

/** Where a base sits on its planet (latitude, longitude in radians, planet frame). */
interface BaseSpot {
  lat: number;
  lon: number;
}

const LIGHTS: Record<Faction, number> = { human: 0xffd36b, alien: 0x6dff7a };

/** Who lives on a planet of another side: name and color (ring and label). */
export interface HomeOf {
  name: string;
  color: string;
}

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

  /** false when the side that lived here is out of the game (no ring). */
  alive = true;

  constructor(
    readonly body: Body,
    kind: 'home' | 'enemy' | 'other',
    private faction: Faction = 'human',
    owner?: HomeOf,
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
    const title =
      kind === 'home'
        ? `${body.name} (Heimat)`
        : owner
          ? `${body.name} (${owner.name})`
          : body.name;
    this.label = textLabel(title, owner?.color);
    this.label.position.y = r * 1.25;
    this.group.add(this.sphere, glow, this.label);
    if (kind === 'home') this.addHome(r);
    if (kind === 'enemy') this.addEnemy(r, owner?.color);
  }

  /** Has a base that the camera can look at (and a surface below it). */
  get hasBase(): boolean {
    return !!this.spot;
  }

  /** Moves along the orbit. The planet always shows the same side to the sun. */
  update(timeMs: number, showBase: boolean, closeUp: boolean, detail = 0): void {
    this.detail.value = detail;
    this.sphere.material = detail > 0 ? this.near : this.far;
    const p = bodyPosition(this.body, timeMs);
    this.group.position.set(p.x, 0, p.y);
    const toSun = Math.atan2(-p.y, -p.x);
    const lon = this.spot?.lon ?? 0;
    this.sphere.rotation.y = lon - toSun - SUN_OFFSET;
    if (this.enemyLights) this.enemyLights.visible = showBase;
    this.label.visible = !closeUp;
    if (this.ring) this.ring.visible = !closeUp && this.alive;
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

  private addRing(r: number, hex: number, thick: number): void {
    this.ring = new Mesh(new TorusGeometry(r * 1.6, thick, 8, 64), solidMaterial(hex, { glow: 2 }));
    this.ring.rotation.x = Math.PI / 2;
    this.group.add(this.ring);
  }

  private addHome(r: number): void {
    this.spot = { lat: 0.35, lon: 0.4 };
    this.placeLights(baseLights(r, LIGHTS[this.faction]), r);
    this.addRing(r, 0x7cff6b, 0.06);
  }

  /** A base of another people (its own faction's lights, shown when known) and a thin ring in its color. */
  private addEnemy(r: number, ring?: string): void {
    this.spot = { lat: -0.3, lon: 2.2 };
    this.enemyLights = baseLights(r, LIGHTS[this.faction]);
    this.placeLights(this.enemyLights, r);
    if (ring) this.addRing(r, parseInt(ring.slice(1), 16), 0.035);
  }
}

/** All planets. Homes of computer sides get the base lights of that side's people. */
export function spaceBodies(system: SolarSystem, faction: Faction): Map<string, SpaceBody> {
  const out = new Map<string, SpaceBody>();
  for (const b of system.bodies) {
    const i = system.homes.indexOf(b.id);
    const id = AI_IDS[i - 1];
    if (!id) {
      out.set(b.id, new SpaceBody(b, i === 0 ? 'home' : 'other', faction));
      continue;
    }
    const f = aiFaction(faction, i - 1);
    out.set(b.id, new SpaceBody(b, 'enemy', f, { name: sideName(id, f), color: SIDE_COLORS[id] }));
  }
  return out;
}
