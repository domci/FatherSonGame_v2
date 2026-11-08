import {
  DodecahedronGeometry,
  Group,
  InstancedMesh,
  Mesh,
  Object3D,
  PlaneGeometry,
  CircleGeometry,
  ConeGeometry,
} from 'three/webgpu';
import { surfaceHeight, type SurfaceMap } from '../../sim/generation/surface';
import { groundMaterial, solidMaterial } from '../materials';

export function toWorldX(map: SurfaceMap, x: number): number {
  return x - map.size / 2;
}

function ground(map: SurfaceMap): Mesh {
  const extra = 40;
  const size = map.size + extra * 2;
  const geo = new PlaneGeometry(size, size, size, size);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  if (!pos) throw new Error('plane without positions');
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) + map.size / 2;
    const z = pos.getZ(i) + map.size / 2;
    pos.setY(i, surfaceHeight(map, x, z));
  }
  geo.computeVertexNormals();
  const mesh = new Mesh(geo, groundMaterial());
  mesh.receiveShadow = true;
  mesh.name = 'ground';
  return mesh;
}

function rocks(map: SurfaceMap): InstancedMesh {
  const cells = map.rocks.map((r, i) => (r ? i : -1)).filter((i) => i >= 0);
  const mesh = new InstancedMesh(
    new DodecahedronGeometry(0.5, 0),
    solidMaterial(0x5b524a, { metal: 0.1, rough: 0.9 }),
    cells.length,
  );
  const dummy = new Object3D();
  cells.forEach((cell, n) => {
    const x = (cell % map.size) + 0.5;
    const y = Math.floor(cell / map.size) + 0.5;
    dummy.position.set(toWorldX(map, x), surfaceHeight(map, x, y) + 0.2, toWorldX(map, y));
    dummy.rotation.set(cell * 0.7, cell * 1.3, cell * 0.4);
    const s = 0.7 + ((cell * 37) % 10) / 15;
    dummy.scale.set(s, s * 0.7, s);
    dummy.updateMatrix();
    mesh.setMatrixAt(n, dummy.matrix);
  });
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function deposits(map: SurfaceMap): Group {
  const group = new Group();
  for (const d of map.deposits) {
    const cx = d.tileX + d.size / 2;
    const cy = d.tileY + d.size / 2;
    const y = surfaceHeight(map, cx, cy) + 0.03;
    if (d.kind === 'pink') {
      const pool = new Mesh(
        new CircleGeometry(0.95, 32),
        solidMaterial(0xd6338f, { glow: 0.35, metal: 0.3, rough: 0.05 }),
      );
      pool.rotation.x = -Math.PI / 2;
      pool.position.set(toWorldX(map, cx), y, toWorldX(map, cy));
      group.add(pool);
    } else {
      for (let i = 0; i < 5; i++) {
        const crystal = new Mesh(
          new ConeGeometry(0.12, 0.6, 5),
          solidMaterial(0x8fe3ff, { glow: 0.8, metal: 0.2, rough: 0.05 }),
        );
        crystal.position.set(
          toWorldX(map, cx) + Math.cos(i * 1.3) * 0.5,
          y + 0.25,
          toWorldX(map, cy) + Math.sin(i * 1.3) * 0.5,
        );
        crystal.rotation.set(Math.sin(i) * 0.4, 0, Math.cos(i) * 0.4);
        group.add(crystal);
      }
    }
  }
  return group;
}

/** Ground, rocks and deposits of one planet surface. */
export function createTerrain(map: SurfaceMap): Group {
  const group = new Group();
  group.add(ground(map), rocks(map), deposits(map));
  return group;
}
