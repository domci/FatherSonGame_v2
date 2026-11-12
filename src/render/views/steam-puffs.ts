import { Group, Mesh, MeshBasicNodeMaterial, SphereGeometry } from 'three/webgpu';
import type { BuildingId } from '../../content/buildings';
import type { Entity } from '../../sim/entity';
import type { SurfaceMap } from '../../sim/generation/surface';
import type { GameState } from '../../sim/state';
import { factionOf } from '../../sim/names';
import { visualHeight } from '../terrain-shape';
import type { Sight } from './surface-entities';

/** Buildings that let off steam, and how high the puffs start. */
const STEAM: Partial<Record<BuildingId, number>> = {
  waterOxygenPlant: 1.1,
  pinkPump: 0.7,
  greenhouse: 0.9,
  medbay: 0.9,
};
const POOL = 40;
const LIFE_MS = 2600;
const EVERY_MS = 1500;
const COLOR = { human: 0xe9eef5, alien: 0xb9ffd2 } as const;

interface Puff {
  mesh: Mesh;
  mat: MeshBasicNodeMaterial;
  age: number;
}

/** Soft white puffs from working plants (aliens: pale green spores). Only for the look. */
export class SteamPuffs {
  readonly group = new Group();
  private puffs: Puff[] = [];
  private next = new Map<number, number>();
  private time = 0;

  constructor(private map: SurfaceMap) {
    const geo = new SphereGeometry(0.16, 8, 6);
    for (let i = 0; i < POOL; i++) {
      const mat = new MeshBasicNodeMaterial({ transparent: true, depthWrite: false, opacity: 0 });
      const mesh = new Mesh(geo, mat);
      mesh.visible = false;
      this.group.add(mesh);
      this.puffs.push({ mesh, mat, age: LIFE_MS });
    }
  }

  update(state: GameState, sight: Sight, dtMs: number): void {
    this.time += dtMs;
    for (const e of state.world.with('building', 'position')) {
      const lift = STEAM[e.building.type];
      if (!lift || !this.works(e, sight)) continue;
      const due = this.next.get(e.id) ?? this.time + (e.id % 7) * 200;
      if (due > this.time) {
        this.next.set(e.id, due);
        continue;
      }
      this.next.set(e.id, this.time + EVERY_MS + (e.id % 5) * 90);
      this.emit(e, lift, COLOR[factionOf(state, e.owner)]);
    }
    for (const p of this.puffs) this.grow(p, dtMs);
  }

  private works(e: Entity, sight: Sight): boolean {
    if (e.zone !== this.map.bodyId || !e.building || e.building.level < 1 || e.construction)
      return false;
    if (e.owner === sight.me || !e.position) return true;
    const tile = Math.floor(e.position.y) * this.map.size + Math.floor(e.position.x);
    return sight.visible[tile] === 1;
  }

  private emit(e: Entity, lift: number, color: number): void {
    const p = this.puffs.find((x) => x.age >= LIFE_MS);
    if (!p || !e.position) return;
    const half = this.map.size / 2;
    const { x, y } = e.position;
    const jitter = ((this.time / 97) % 1) - 0.5;
    p.mesh.position.set(
      x - half + jitter * 0.3,
      visualHeight(this.map, x, y) + lift,
      y - half - jitter * 0.2,
    );
    p.mat.color.setHex(color);
    p.age = 0;
    p.mesh.visible = true;
  }

  private grow(p: Puff, dtMs: number): void {
    if (p.age >= LIFE_MS) return;
    p.age += dtMs;
    const t = Math.min(1, p.age / LIFE_MS);
    p.mesh.position.y += (dtMs / 1000) * 0.35;
    p.mesh.scale.setScalar(0.6 + t * 1.6);
    p.mat.opacity = 0.42 * (1 - t) * Math.min(1, t * 6);
    if (t >= 1) p.mesh.visible = false;
  }
}
