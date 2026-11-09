import {
  AdditiveBlending,
  Color,
  Group,
  Mesh,
  MeshBasicNodeMaterial,
  SphereGeometry,
  type Vector3,
} from 'three/webgpu';
import {
  abs,
  dot,
  float,
  normalView,
  positionLocal,
  positionViewDirection,
  sin,
  time,
  uniform,
  vec3,
} from 'three/tsl';

/** Upper half of a sphere: the force-field dome over a shield reactor. */
const DOME = new SphereGeometry(1, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2);

interface Bubble {
  mesh: Mesh;
  flash: { value: number };
  strength: { value: number };
  lastHit: number;
}

function makeBubble(hex: number): Bubble {
  const flash = uniform(0);
  const strength = uniform(1);
  const c = new Color(hex);
  const mat = new MeshBasicNodeMaterial({
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
  });
  const rim = float(1)
    .sub(abs(dot(normalView, positionViewDirection)))
    .pow(2.2);
  const bands = sin(positionLocal.y.mul(26).sub(time.mul(2.5)))
    .mul(0.5)
    .add(0.5)
    .pow(10);
  const glow = rim.mul(0.55).add(bands.mul(0.12)).add(0.04).add(flash.mul(0.6));
  mat.colorNode = vec3(c.r, c.g, c.b).mul(glow.mul(strength.mul(0.7).add(0.3)));
  const mesh = new Mesh(DOME, mat);
  mesh.renderOrder = 2;
  return { mesh, flash, strength, lastHit: 0 };
}

export interface BubbleInfo {
  id: number;
  at: Vector3;
  radius: number;
  hp: number;
  max: number;
  hitAt: number;
  color: number;
}

/** Glowing domes over shield reactors. They flash when hit. */
export class ShieldBubbles {
  readonly group = new Group();
  private bubbles = new Map<number, Bubble>();

  update(list: BubbleInfo[], dtMs: number): void {
    const seen = new Set<number>();
    for (const info of list) {
      seen.add(info.id);
      let b = this.bubbles.get(info.id);
      if (!b) {
        b = makeBubble(info.color);
        b.lastHit = info.hitAt;
        this.bubbles.set(info.id, b);
        this.group.add(b.mesh);
      }
      if (info.hitAt !== b.lastHit) {
        b.flash.value = 1;
        b.lastHit = info.hitAt;
      }
      b.flash.value = Math.max(0, b.flash.value - dtMs / 400);
      b.strength.value = info.hp / Math.max(1, info.max);
      b.mesh.position.copy(info.at);
      b.mesh.scale.set(info.radius, info.radius * 0.75, info.radius);
    }
    for (const [id, b] of this.bubbles) {
      if (seen.has(id)) continue;
      this.group.remove(b.mesh);
      (b.mesh.material as MeshBasicNodeMaterial).dispose();
      this.bubbles.delete(id);
    }
  }
}
