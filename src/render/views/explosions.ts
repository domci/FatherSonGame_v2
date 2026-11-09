import {
  AdditiveBlending,
  Color,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  Mesh,
  MeshBasicNodeMaterial,
  Object3D,
  type Vector3,
} from 'three/webgpu';
import type { Mark } from '../../sim/state';

interface Style {
  sparks: number;
  smoke: number;
  speed: number;
  size: number;
  life: number;
  flash: number;
  colors: number[];
}

/** No blood, no gore: sparks and smoke for machines, violet dust for spiders. */
const STYLES: Record<Mark['kind'], Style> = {
  unit: {
    sparks: 16,
    smoke: 4,
    speed: 4,
    size: 0.1,
    life: 800,
    flash: 1.3,
    colors: [0xffd27a, 0xff8a3d, 0xfff2c4],
  },
  building: {
    sparks: 28,
    smoke: 12,
    speed: 6,
    size: 0.16,
    life: 1500,
    flash: 3.2,
    colors: [0xffc061, 0xff6a2a, 0xfff2c4],
  },
  spider: {
    sparks: 14,
    smoke: 6,
    speed: 2.5,
    size: 0.12,
    life: 900,
    flash: 0.6,
    colors: [0x9b6bff, 0x6a3fc0, 0xc9a8ff],
  },
  egg: {
    sparks: 10,
    smoke: 0,
    speed: 2,
    size: 0.09,
    life: 700,
    flash: 0.4,
    colors: [0xd9ffb0, 0x9bd66b],
  },
};

const SPARK_GEO = new IcosahedronGeometry(1, 0);
const SMOKE = new Color(0x4a4744);
const MAX_BURSTS = 24;

interface Burst {
  root: Group;
  parts: InstancedMesh;
  flash: Mesh;
  vel: Float32Array;
  born: number;
  style: Style;
}

function makeBurst(style: Style, seed: number): Burst {
  const n = style.sparks + style.smoke;
  const mat = new MeshBasicNodeMaterial({ transparent: true, depthWrite: false });
  const parts = new InstancedMesh(SPARK_GEO, mat, n);
  parts.frustumCulled = false;
  const vel = new Float32Array(n * 3);
  const c = new Color();
  for (let i = 0; i < n; i++) {
    const a = (i * 2.399 + seed) % (Math.PI * 2);
    const smoke = i >= style.sparks;
    const s = style.speed * (smoke ? 0.25 : 0.5 + ((i * 7 + seed) % 10) / 20);
    vel.set([Math.cos(a) * s, smoke ? 1.2 : s * 0.9, Math.sin(a) * s], i * 3);
    c.setHex(style.colors[i % style.colors.length] ?? 0xffffff);
    parts.setColorAt(i, smoke ? SMOKE : c);
  }
  const flashMat = new MeshBasicNodeMaterial({
    color: style.colors[2] ?? 0xffffff,
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
  });
  const flash = new Mesh(SPARK_GEO, flashMat);
  const root = new Group();
  root.add(parts, flash);
  return { root, parts, flash, vel, born: 0, style };
}

const dummy = new Object3D();

function animate(b: Burst, age: number): void {
  const { style } = b;
  const t = (age * style.life) / 1000;
  for (let i = 0; i < b.parts.count; i++) {
    const smoke = i >= style.sparks;
    const g = smoke ? 0 : -7;
    dummy.position.set(b.vel[i * 3] ?? 0, 0, b.vel[i * 3 + 2] ?? 0).multiplyScalar(t);
    dummy.position.y = Math.max(-0.2, (b.vel[i * 3 + 1] ?? 0) * t + 0.5 * g * t * t);
    const size = smoke ? style.size * (2 + age * 5) : style.size * (1 - age * 0.7);
    dummy.scale.setScalar(size);
    dummy.updateMatrix();
    b.parts.setMatrixAt(i, dummy.matrix);
  }
  b.parts.instanceMatrix.needsUpdate = true;
  (b.parts.material as MeshBasicNodeMaterial).opacity = 1 - age * age;
  b.flash.scale.setScalar(style.flash * (0.3 + Math.min(1, age * 4)));
  (b.flash.material as MeshBasicNodeMaterial).opacity = Math.max(0, 1 - age * 3.5);
}

/** Bursts of sparks, a flash and smoke where something was destroyed. */
export class Explosions {
  readonly group = new Group();
  private bursts: Burst[] = [];
  private clock = 0;

  spawn(at: Vector3, kind: Mark['kind'], seed: number): void {
    if (this.bursts.length >= MAX_BURSTS) this.drop(0);
    const burst = makeBurst(STYLES[kind], seed);
    burst.root.position.copy(at);
    burst.born = this.clock;
    this.group.add(burst.root);
    this.bursts.push(burst);
    animate(burst, 0);
  }

  update(dtMs: number): void {
    this.clock += dtMs;
    for (let i = this.bursts.length - 1; i >= 0; i--) {
      const b = this.bursts[i];
      if (!b) continue;
      const age = (this.clock - b.born) / b.style.life;
      if (age >= 1) this.drop(i);
      else animate(b, age);
    }
  }

  private drop(index: number): void {
    const [b] = this.bursts.splice(index, 1);
    if (!b) return;
    this.group.remove(b.root);
    b.parts.dispose();
    (b.parts.material as MeshBasicNodeMaterial).dispose();
    (b.flash.material as MeshBasicNodeMaterial).dispose();
  }
}
