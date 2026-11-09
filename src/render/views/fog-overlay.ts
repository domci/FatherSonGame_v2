import {
  DataTexture,
  LinearFilter,
  Mesh,
  MeshBasicNodeMaterial,
  PlaneGeometry,
  RedFormat,
  UnsignedByteType,
} from 'three/webgpu';
import { positionWorld, texture, vec2 } from 'three/tsl';
import type { SurfaceMap } from '../../sim/generation/surface';
import { visualHeight } from '../terrain-shape';

/** Darkness (0..255) per tile: never seen, seen before, in sight now. */
const DARK = { unknown: 215, remembered: 110, visible: 0 } as const;
const LIFT = 0.45;
/** The ground reaches past the map edge; the fog covers that ring too. */
const RING = 50;

/** A dark veil over the ground where the player sees nothing (fog of war). */
export class FogOverlay {
  readonly mesh: Mesh;
  private data: Uint8Array;
  private tex: DataTexture;

  constructor(private map: SurfaceMap) {
    const n = map.size;
    this.data = new Uint8Array(n * n).fill(DARK.unknown);
    this.tex = new DataTexture(this.data, n, n, RedFormat, UnsignedByteType);
    this.tex.magFilter = LinearFilter;
    this.tex.minFilter = LinearFilter;
    this.tex.needsUpdate = true;
    const full = n + RING * 2;
    const geo = new PlaneGeometry(full, full, full, full).rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    if (pos)
      for (let i = 0; i < pos.count; i++)
        pos.setY(i, visualHeight(map, pos.getX(i) + n / 2, pos.getZ(i) + n / 2) + LIFT);
    const mat = new MeshBasicNodeMaterial({
      color: 0x030408,
      transparent: true,
      depthWrite: false,
    });
    const uv = vec2(positionWorld.x.add(n / 2).div(n), positionWorld.z.add(n / 2).div(n));
    mat.opacityNode = texture(this.tex, uv).r;
    this.mesh = new Mesh(geo, mat);
    this.mesh.renderOrder = 1;
    this.mesh.name = 'fog';
  }

  update(visible: Uint8Array, explored: Uint8Array): void {
    let changed = false;
    for (let i = 0; i < this.data.length; i++) {
      const v = visible[i] ? DARK.visible : explored[i] ? DARK.remembered : DARK.unknown;
      if (this.data[i] === v) continue;
      this.data[i] = v;
      changed = true;
    }
    if (changed) this.tex.needsUpdate = true;
  }

  get size(): number {
    return this.map.size;
  }
}
