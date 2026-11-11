import type { Vector3 } from 'three/webgpu';
import { CapsuleGeometry, Group, InstancedMesh, Object3D, SphereGeometry } from 'three/webgpu';
import type { Faction } from '../../content/factions';
import type { PlayerId } from '../../sim/entity';
import type { GameState } from '../../sim/state';
import { solidMaterial } from '../materials';
import { partMaterial } from '../models/parts';

/** One tunnel between two buildings (in scene units, on the ground). */
export interface TunnelPath {
  owner: PlayerId;
  faction: Faction;
  from: Vector3;
  to: Vector3;
  /** The tunnel model: hidden in the fog = no walkers. */
  node: Object3D;
}

const MAX = 48;
/** Scene units per second. */
const SPEED = 0.45;
/** One walker for this many people. */
const PEOPLE_PER_WALKER = 2;
const PER_TUNNEL = 4;

/**
 * People walking through the glass tunnels (humans) or glowing pulses in the veins (aliens).
 * More people in the colony = more walkers. Only for the look: the rules do not know them.
 */
export class TunnelWalkers {
  readonly group = new Group();
  private humans = new InstancedMesh(
    new CapsuleGeometry(0.06, 0.11, 4, 8),
    solidMaterial(0xfff4e6, { metal: 0.1, rough: 0.6, glow: 0.35 }),
    MAX,
  );
  private aliens = new InstancedMesh(
    new SphereGeometry(0.14, 10, 8),
    partMaterial('glowGreen'),
    MAX,
  );
  private dummy = new Object3D();
  private time = 0;

  constructor() {
    for (const m of [this.humans, this.aliens]) {
      m.count = 0;
      m.frustumCulled = false;
      this.group.add(m);
    }
  }

  update(state: GameState, paths: readonly TunnelPath[], dtMs: number): void {
    this.time += dtMs / 1000;
    const count = { human: 0, alien: 0 };
    for (const owner of Object.keys(state.players) as PlayerId[]) {
      const shown = paths.filter((p) => p.owner === owner && p.node.visible);
      const people = state.players[owner]?.colony.people ?? 0;
      const n = Math.min(Math.ceil(people / PEOPLE_PER_WALKER), shown.length * PER_TUNNEL);
      for (let i = 0; i < n; i++) {
        const path = shown[i % shown.length];
        if (!path || count[path.faction] >= MAX) continue;
        this.place(path, i);
        const mesh = path.faction === 'alien' ? this.aliens : this.humans;
        mesh.setMatrixAt(count[path.faction]++, this.dummy.matrix);
      }
    }
    this.humans.count = count.human;
    this.aliens.count = count.alien;
    this.humans.instanceMatrix.needsUpdate = true;
    this.aliens.instanceMatrix.needsUpdate = true;
  }

  /** Walks from one end to the other and back. Walkers in the other direction keep right. */
  private place(path: TunnelPath, i: number): void {
    const length = Math.max(0.3, path.from.distanceTo(path.to));
    // Golden-ratio phases spread the walkers; half of them walk the other way.
    const s = ((this.time * SPEED) / length + i * 1.236) % 2;
    const back = s >= 1;
    const u = back ? 2 - s : s;
    const d = this.dummy;
    d.position.lerpVectors(path.from, path.to, u);
    d.lookAt(back ? path.from : path.to);
    if (path.faction === 'alien') {
      d.position.y = 0.11;
      d.scale.set(1, 0.65, 1.5);
    } else {
      d.translateX(back ? 0.07 : -0.07);
      d.position.y = 0.16 + Math.abs(Math.sin(this.time * 9 + i)) * 0.012;
      d.scale.setScalar(1);
    }
    d.updateMatrix();
  }
}
