import {
  BufferGeometry,
  DodecahedronGeometry,
  Float32BufferAttribute,
  Group,
  InstancedMesh,
  Line,
  LineBasicNodeMaterial,
  Mesh,
  Object3D,
  SphereGeometry,
  TorusGeometry,
} from 'three/webgpu';
import { BELT_ID, type Body, type SolarSystem } from '../../sim/generation/solar-system';
import { atmosphereMaterial, planetMaterial, sunMaterial } from '../space-materials';
import { solidMaterial } from '../materials';

export function orbitLine(radius: number): Line {
  const pts: number[] = [];
  for (let i = 0; i <= 128; i++) {
    const a = (i / 128) * Math.PI * 2;
    pts.push(Math.cos(a) * radius, 0, Math.sin(a) * radius);
  }
  const geo = new BufferGeometry();
  geo.setAttribute('position', new Float32BufferAttribute(pts, 3));
  return new Line(
    geo,
    new LineBasicNodeMaterial({ color: 0x3a4a6a, transparent: true, opacity: 0.6 }),
  );
}

export function sunObject(radius: number): Group {
  const g = new Group();
  g.add(new Mesh(new SphereGeometry(radius, 48, 32), sunMaterial()));
  g.add(new Mesh(new SphereGeometry(radius * 1.35, 48, 32), atmosphereMaterial(0xffa040, 1.4)));
  return g;
}

export function planetObject(body: Body, isHome: boolean): Group {
  const g = new Group();
  const planet = new Mesh(
    new SphereGeometry(body.radius, 48, 32),
    planetMaterial(body, body.radius),
  );
  planet.userData.bodyId = body.id;
  g.add(planet);
  g.add(
    new Mesh(
      new SphereGeometry(body.radius * 1.12, 32, 24),
      atmosphereMaterial(body.kind === 'gas' ? body.color : 0x88b8ff, 0.8),
    ),
  );
  if (isHome) {
    const ring = new Mesh(
      new TorusGeometry(body.radius * 1.6, 0.06, 8, 64),
      solidMaterial(0x7cff6b, { glow: 2 }),
    );
    ring.rotation.x = Math.PI / 2;
    g.add(ring);
  }
  return g;
}

export function selectionMarker(): Mesh {
  const m = new Mesh(new TorusGeometry(1, 0.05, 8, 64), solidMaterial(0xffd36b, { glow: 2.5 }));
  m.rotation.x = Math.PI / 2;
  m.visible = false;
  return m;
}

/** Asteroid belt: many small rocks in one draw call. */
export function beltObject(system: SolarSystem, count = 1600): InstancedMesh {
  const { inner, outer } = system.belt;
  const mesh = new InstancedMesh(
    new DodecahedronGeometry(0.18, 0),
    solidMaterial(0x8a8178, { metal: 0.2, rough: 0.9 }),
    count,
  );
  const dummy = new Object3D();
  let seed = system.seed % 2147483647 || 1;
  const rand = (): number => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < count; i++) {
    const a = rand() * Math.PI * 2;
    const r = inner + rand() * (outer - inner);
    dummy.position.set(Math.cos(a) * r, (rand() - 0.5) * 0.8, Math.sin(a) * r);
    dummy.rotation.set(rand() * 6, rand() * 6, rand() * 6);
    dummy.scale.setScalar(0.4 + rand() * 1.4);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }
  mesh.userData.bodyId = BELT_ID;
  return mesh;
}
