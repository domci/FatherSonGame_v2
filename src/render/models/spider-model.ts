import {
  CylinderGeometry,
  Group,
  Mesh,
  SphereGeometry,
  Vector3,
  type Object3D,
} from 'three/webgpu';
import { solidMaterial } from '../materials';

const chitin = (): ReturnType<typeof solidMaterial> =>
  solidMaterial(0x2b1a3a, { metal: 0.35, rough: 0.32 });
const chitinLight = (): ReturnType<typeof solidMaterial> =>
  solidMaterial(0x4a2c5e, { metal: 0.3, rough: 0.4 });
const glow = (): ReturnType<typeof solidMaterial> => solidMaterial(0xff3fb4, { glow: 3 });

function blob(
  r: number,
  pos: [number, number, number],
  scale: [number, number, number],
  mat = chitin(),
): Mesh {
  const m = new Mesh(new SphereGeometry(r, 20, 14), mat);
  m.position.set(...pos);
  m.scale.set(...scale);
  m.castShadow = true;
  return m;
}

/** A tapered tube from a to b. */
function segment(a: Vector3, b: Vector3, r1: number, r2: number): Mesh {
  const len = a.distanceTo(b);
  const m = new Mesh(new CylinderGeometry(r2, r1, len, 8), chitinLight());
  m.position.copy(a).lerp(b, 0.5);
  m.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), b.clone().sub(a).normalize());
  m.castShadow = true;
  return m;
}

function leg(side: number, z: number, splay: number): Group {
  const g = new Group();
  g.position.set(side * 0.1, 0.33, z);
  g.rotation.y = splay * side;
  const hip = new Vector3(0, 0, 0);
  const knee = new Vector3(side * 0.3, 0.16, 0);
  const foot = new Vector3(side * 0.56, -0.33, 0);
  g.add(segment(hip, knee, 0.032, 0.026), segment(knee, foot, 0.026, 0.008));
  const joint = blob(0.03, [knee.x, knee.y, knee.z], [1, 1, 1], chitin());
  g.add(joint);
  return g;
}

function eyes(): Mesh[] {
  const spots: [number, number, number, number][] = [
    [0.045, 0.37, 0.38, 0.034],
    [-0.045, 0.37, 0.38, 0.034],
    [0.1, 0.36, 0.33, 0.022],
    [-0.1, 0.36, 0.33, 0.022],
    [0.03, 0.42, 0.34, 0.02],
    [-0.03, 0.42, 0.34, 0.02],
  ];
  return spots.map(([x, y, z, r]) => blob(r, [x, y, z], [1, 1, 1], glow()));
}

/** Six-eyed spider creature, about 1.1 tiles wide. Legs are named leg0..leg5. */
export function spiderModel(): Group {
  const g = new Group();
  g.add(
    blob(0.26, [0, 0.36, -0.3], [1, 0.8, 1.25]),
    blob(0.17, [0, 0.33, 0.06], [1, 0.75, 1.1]),
    blob(0.12, [0, 0.34, 0.27], [1, 0.9, 1]),
    ...eyes(),
  );
  for (const [x, z] of [
    [0.1, -0.2],
    [-0.12, -0.32],
    [0.05, -0.45],
  ] as const)
    g.add(blob(0.025, [x, 0.53, z], [1, 1, 1], glow()));
  for (const side of [-1, 1]) {
    const fang = segment(
      new Vector3(side * 0.04, 0.3, 0.35),
      new Vector3(side * 0.02, 0.2, 0.42),
      0.02,
      0.005,
    );
    g.add(fang);
  }
  [0.16, 0.06, -0.05].forEach((z, i) => {
    for (const side of [-1, 1]) {
      const l = leg(side, z, (1 - i) * 0.45);
      l.name = `leg${i * 2 + (side > 0 ? 1 : 0)}`;
      l.userData.baseY = l.rotation.y;
      g.add(l);
    }
  });
  return g;
}

/** Tripod walk: legs swing in two groups of three. */
export function animateSpider(body: Object3D, t: number, walking: number): void {
  for (let i = 0; i < 6; i++) {
    const l = body.getObjectByName(`leg${i}`);
    if (!l) continue;
    const phase = (i % 2 === 0) === (Math.floor(i / 2) % 2 === 0) ? 0 : Math.PI;
    const base = typeof l.userData.baseY === 'number' ? l.userData.baseY : 0;
    l.rotation.y = base + Math.sin(t * 10 + phase) * 0.28 * walking;
    l.rotation.x = Math.max(0, Math.cos(t * 10 + phase)) * 0.18 * walking;
  }
  body.position.y = Math.abs(Math.sin(t * 10)) * 0.03 * walking;
}
