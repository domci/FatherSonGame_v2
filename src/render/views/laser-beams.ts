import {
  AdditiveBlending,
  CylinderGeometry,
  Group,
  Mesh,
  MeshBasicNodeMaterial,
  type Vector3,
} from 'three/webgpu';

const BEAM_MS = 180;
const WIDTH = 0.06;

/** Unit cylinder along +z (length 1), so a beam is scaled to its length. */
const GEO = new CylinderGeometry(1, 1, 1, 6, 1, true).rotateX(Math.PI / 2);

interface Beam {
  mesh: Mesh;
  mat: MeshBasicNodeMaterial;
  born: number;
  width: number;
  life: number;
}

/** Short glowing laser shots. Meshes are reused (pool). */
export class LaserBeams {
  readonly group = new Group();
  private pool: Beam[] = [];
  private clock = 0;

  /** A shot. Wider and longer-lasting beams for big guns (shots from orbit). */
  fire(from: Vector3, to: Vector3, color: number, width = WIDTH, life = BEAM_MS): void {
    const beam = this.pool.find((b) => !b.mesh.visible) ?? this.make();
    beam.mat.color.setHex(color);
    beam.mesh.position.copy(from).add(to).multiplyScalar(0.5);
    beam.mesh.lookAt(to);
    beam.mesh.scale.set(width, width, Math.max(0.01, from.distanceTo(to)));
    beam.born = this.clock;
    beam.width = width;
    beam.life = life;
    beam.mesh.visible = true;
  }

  update(dtMs: number): void {
    this.clock += dtMs;
    for (const b of this.pool) {
      if (!b.mesh.visible) continue;
      const age = (this.clock - b.born) / b.life;
      if (age >= 1) {
        b.mesh.visible = false;
        continue;
      }
      b.mat.opacity = 1 - age;
      const w = b.width * (1.3 - age);
      b.mesh.scale.x = w;
      b.mesh.scale.y = w;
    }
  }

  private make(): Beam {
    const mat = new MeshBasicNodeMaterial({
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    const mesh = new Mesh(GEO, mat);
    mesh.visible = false;
    mesh.frustumCulled = false;
    this.group.add(mesh);
    const beam = { mesh, mat, born: 0, width: WIDTH, life: BEAM_MS };
    this.pool.push(beam);
    return beam;
  }
}
