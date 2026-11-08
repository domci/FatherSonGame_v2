import { CircleGeometry, ConeGeometry, Group, Mesh, MeshStandardNodeMaterial } from 'three/webgpu';
import {
  color,
  float,
  length,
  mix,
  mx_noise_float,
  positionLocal,
  positionWorld,
  sin,
  time,
  vec3,
} from 'three/tsl';
import { buildModel } from '../models/parts';
import type { SurfaceMap } from '../../sim/generation/surface';
import { visualHeight } from '../terrain-shape';
import { solidMaterial } from '../materials';

/** Glowing pink liquid that slowly swirls: dark and deep in the middle, bright at the edge. */
function pinkMaterial(): MeshStandardNodeMaterial {
  const m = new MeshStandardNodeMaterial({ metalness: 0.1, roughness: 0.05 });
  const p = positionWorld.xz;
  const swirl = mx_noise_float(vec3(p.mul(1.6), time.mul(0.25)))
    .mul(0.5)
    .add(0.5);
  const edge = length(positionLocal.xy).div(1.05).pow(2);
  const ripple = sin(length(positionLocal.xy).mul(14).sub(time.mul(2)))
    .mul(0.5)
    .add(0.5);
  m.colorNode = mix(color(0x3a0628), color(0xff4fb8), edge.mul(0.6).add(swirl.mul(0.4)));
  m.emissiveNode = color(0xff2fa0).mul(
    float(0.08).add(edge.mul(0.35)).add(swirl.mul(0.15)).add(ripple.mul(0.06)),
  );
  return m;
}

function pool(map: SurfaceMap, cx: number, cy: number): Group {
  const g = new Group();
  const y = visualHeight(map, cx, cy);
  const liquid = new Mesh(new CircleGeometry(1.05, 48), pinkMaterial());
  liquid.rotation.x = -Math.PI / 2;
  g.add(liquid);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + Math.sin(i * 3.1) * 0.2;
    const rock = buildModel([
      {
        kit: i % 2 ? 'rocks_smallA' : 'rocks_smallB',
        scale: 0.7 + ((i * 5) % 4) * 0.12,
        mats: { rock: 'dark', rockTrack: 'dark', rockDark: 'dark' },
      },
    ]);
    rock.position.set(Math.cos(a) * 1.2, -0.05, Math.sin(a) * 1.2);
    rock.rotation.y = a * 2.3;
    g.add(rock);
  }
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
