import {
  Color,
  DodecahedronGeometry,
  Float32BufferAttribute,
  Group,
  InstancedMesh,
  Mesh,
  Object3D,
  PlaneGeometry,
  type BufferGeometry,
} from 'three/webgpu';
import type { SurfaceMap } from '../../sim/generation/surface';
import { fbm } from '../noise';
import { visualHeight } from '../terrain-shape';
import { groundMaterial, solidMaterial } from '../materials';
import { createDeposits } from './surface-deposits';

export function toWorldX(map: SurfaceMap, x: number): number {
  return x - map.size / 2;
}

const DARK = new Color(0x3b3632);
const LIGHT = new Color(0x9c9184);
const RUST = new Color(0x8a5536);
const BASALT = new Color(0x2c2f36);

/** Colors per vertex: darker in craters, lighter on rims, some rusty patches. */
function paint(geo: BufferGeometry, map: SurfaceMap): void {
  const pos = geo.attributes.position;
  if (!pos) return;
  const colors: number[] = [];
  const c = new Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) + map.size / 2;
    const z = pos.getZ(i) + map.size / 2;
    const h = pos.getY(i);
    const n = fbm(x * 0.08, z * 0.08, 21) + 0.5;
    c.copy(DARK).lerp(LIGHT, Math.min(1, Math.max(0, 0.45 + h * 0.5 + (n - 0.5) * 0.6)));
    c.lerp(RUST, Math.min(0.75, Math.max(0, fbm(x * 0.05, z * 0.05, 33) * 2.2)));
    c.lerp(BASALT, Math.min(0.7, Math.max(0, fbm(x * 0.03, z * 0.03, 47) * 2.4 - 0.15)));
    colors.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new Float32BufferAttribute(colors, 3));
}

function ground(map: SurfaceMap): Mesh {
  const extra = 50;
  const size = map.size + extra * 2;
  const geo = new PlaneGeometry(size, size, size * 2, size * 2);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  if (!pos) throw new Error('plane without positions');
  for (let i = 0; i < pos.count; i++) {
    pos.setY(i, visualHeight(map, pos.getX(i) + map.size / 2, pos.getZ(i) + map.size / 2));
  }
  geo.computeVertexNormals();
  paint(geo, map);
  const mesh = new Mesh(geo, groundMaterial());
  mesh.receiveShadow = true;
  mesh.name = 'ground';
  return mesh;
}

function rocks(map: SurfaceMap): InstancedMesh {
  const cells = map.rocks.map((r, i) => (r ? i : -1)).filter((i) => i >= 0);
  const geo = new DodecahedronGeometry(0.5, 1);
  const p = geo.attributes.position;
  if (p)
    for (let i = 0; i < p.count; i++)
      p.setXYZ(i, p.getX(i) * (1 + fbm(i, 1, 5) * 0.6), p.getY(i), p.getZ(i));
  geo.computeVertexNormals();
  const mesh = new InstancedMesh(
    geo,
    solidMaterial(0x57504a, { metal: 0.05, rough: 0.95 }),
    cells.length,
  );
  const dummy = new Object3D();
  cells.forEach((cell, n) => {
    const x = (cell % map.size) + 0.5;
    const y = Math.floor(cell / map.size) + 0.5;
    dummy.position.set(toWorldX(map, x), visualHeight(map, x, y) + 0.1, toWorldX(map, y));
    dummy.rotation.set(cell * 0.7, cell * 1.3, cell * 0.4);
    const s = 0.6 + ((cell * 37) % 10) / 12;
    dummy.scale.set(s * 1.2, s * 0.6, s);
    dummy.updateMatrix();
    mesh.setMatrixAt(n, dummy.matrix);
  });
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/** Ground, rocks and deposits of one planet surface. */
export function createTerrain(map: SurfaceMap): Group {
  const group = new Group();
  group.add(ground(map), rocks(map), createDeposits(map));
  return group;
}
