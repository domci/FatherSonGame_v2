import {
  CircleGeometry,
  ConeGeometry,
  Group,
  Mesh,
  MeshStandardNodeMaterial,
  RingGeometry,
} from 'three/webgpu';
import { color, float, mix, mx_noise_float, positionWorld, sin, time, vec3 } from 'three/tsl';
import type { SurfaceMap } from '../../sim/generation/surface';
import { visualHeight } from '../terrain-shape';
import { solidMaterial } from '../materials';

/** Glowing pink liquid that slowly swirls. */
function pinkMaterial(): MeshStandardNodeMaterial {
  const m = new MeshStandardNodeMaterial({ metalness: 0.2, roughness: 0.08 });
  const p = positionWorld.xz;
  const swirl = mx_noise_float(vec3(p.mul(1.4), time.mul(0.3)));
  const ripple = sin(positionWorld.x.mul(5).add(positionWorld.z.mul(3)).add(time.mul(1.5)))
    .mul(0.5)
    .add(0.5);
  m.colorNode = mix(color(0x8a1458), color(0xff4fb8), swirl.mul(0.5).add(0.5));
  m.emissiveNode = color(0xff3aa8).mul(float(0.25).add(ripple.mul(0.25)).add(swirl.mul(0.2)));
  return m;
}

function pool(map: SurfaceMap, cx: number, cy: number): Group {
  const g = new Group();
  const y = visualHeight(map, cx, cy);
  const liquid = new Mesh(new CircleGeometry(1.05, 40), pinkMaterial());
  liquid.rotation.x = -Math.PI / 2;
  const rim = new Mesh(
    new RingGeometry(1.0, 1.35, 40),
    solidMaterial(0x5a3a4a, { metal: 0.1, rough: 0.9 }),
  );
  rim.rotation.x = -Math.PI / 2;
  rim.position.y = 0.01;
  g.add(liquid, rim);
  g.position.set(cx - map.size / 2, y + 0.04, cy - map.size / 2);
  return g;
}

function crystals(map: SurfaceMap, cx: number, cy: number): Group {
  const g = new Group();
  const mat = solidMaterial(0x8fe3ff, { glow: 0.7, metal: 0.1, rough: 0.05 });
  for (let i = 0; i < 9; i++) {
    const h = 0.4 + ((i * 7) % 5) * 0.15;
    const c = new Mesh(new ConeGeometry(0.1 + (i % 3) * 0.04, h, 6), mat);
    const r = (i / 9) * 0.8;
    c.position.set(Math.cos(i * 2.1) * r, h / 2, Math.sin(i * 2.1) * r);
    c.rotation.set(Math.sin(i * 1.7) * 0.5, 0, Math.cos(i * 1.3) * 0.5);
    c.castShadow = true;
    g.add(c);
  }
  g.position.set(cx - map.size / 2, visualHeight(map, cx, cy), cy - map.size / 2);
  return g;
}

export function createDeposits(map: SurfaceMap): Group {
  const group = new Group();
  for (const d of map.deposits) {
    const cx = d.tileX + d.size / 2;
    const cy = d.tileY + d.size / 2;
    group.add(d.kind === 'pink' ? pool(map, cx, cy) : crystals(map, cx, cy));
  }
  return group;
}
