import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  Mesh,
  MeshBasicNodeMaterial,
  Points,
  PointsNodeMaterial,
  SphereGeometry,
} from 'three/webgpu';
import { color, float, positionLocal, sin, time, vec3 } from 'three/tsl';
import { atmosphereMaterial, planetMaterial } from '../space-materials';
import { seededRandom } from '../noise';
import { createStars } from '../stars';

/** A big gas planet and the sun hanging in the black sky. */
export function createSky(): Group {
  const g = new Group();
  g.add(createStars(900, 4000));
  const giant = new Group();
  giant.add(
    new Mesh(new SphereGeometry(70, 64, 48), planetMaterial({ kind: 'gas', color: 0xd9a066 }, 70)),
  );
  giant.add(new Mesh(new SphereGeometry(76, 64, 48), atmosphereMaterial(0xffc890, 1.1)));
  giant.position.set(-320, 160, -520);
  giant.rotation.z = 0.35;
  const sun = new Mesh(
    new SphereGeometry(9, 32, 16),
    new MeshBasicNodeMaterial({ color: new Color(6, 5, 4) }),
  );
  sun.position.set(380, 240, 260);
  const halo = new Mesh(new SphereGeometry(22, 32, 16), atmosphereMaterial(0xffb060, 1.5));
  halo.position.copy(sun.position);
  g.add(giant, sun, halo);
  return g;
}

/** Fine dust that floats slowly over the ground. */
export function createDust(size: number, count = 600): Points {
  const rand = seededRandom(4242);
  const pos: number[] = [];
  for (let i = 0; i < count; i++)
    pos.push((rand() - 0.5) * size, rand() * 3, (rand() - 0.5) * size);
  const geo = new BufferGeometry();
  geo.setAttribute('position', new Float32BufferAttribute(pos, 3));
  const m = new PointsNodeMaterial({
    size: 2.5,
    sizeAttenuation: false,
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
  });
  const t = time.mul(0.25);
  m.positionNode = positionLocal.add(
    vec3(
      sin(t.add(positionLocal.z)).mul(1.2),
      sin(t.mul(1.7).add(positionLocal.x)).mul(0.3),
      sin(t.mul(0.8).add(positionLocal.y.mul(3))).mul(1.2),
    ),
  );
  m.colorNode = color(0xd8c8b0);
  m.opacityNode = float(0.35);
  return new Points(geo, m);
}
