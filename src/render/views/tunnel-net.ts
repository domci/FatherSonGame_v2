import { Group, Mesh, Vector3, type Material } from 'three/webgpu';
import { BUILDINGS } from '../../content/buildings';
import type { Faction } from '../../content/factions';
import type { Entity, PlayerId } from '../../sim/entity';
import type { SurfaceMap } from '../../sim/generation/surface';
import type { GameState } from '../../sim/state';
import { boxOf, gapBetween, networkBuildings, TUNNEL_REACH } from '../../sim/tunnels';
import { kitModel } from '../models/kit';
import { partMaterial, type MaterialName } from '../models/parts';
import type { Sight } from './surface-entities';
import { TunnelWalkers, type TunnelPath } from './tunnel-walkers';

const REFRESH_MS = 500;
const FRONT = new Vector3(0, 0, 1);

interface Link {
  a: Entity;
  b: Entity;
}

/** Shortest set of tunnels that joins all buildings (Prim's tree, only short links). */
export function tunnelLinks(list: Entity[]): Link[] {
  const links: Link[] = [];
  const inTree = new Set<Entity>(list.slice(0, 1));
  for (;;) {
    let best: (Link & { d: number }) | undefined;
    for (const a of inTree)
      for (const b of list) {
        const [ba, bb] = [boxOf(a), boxOf(b)];
        if (inTree.has(b) || !ba || !bb) continue;
        const d = gapBetween(ba, bb);
        if (d <= TUNNEL_REACH + 0.5 && (!best || d < best.d)) best = { a, b, d };
      }
    if (!best) return links;
    inTree.add(best.b);
    links.push(best);
  }
}

type TunnelMat = MaterialName;
const materials: Partial<Record<string, Material>> = {};
/** One material per name for all tunnels (a base has many pieces). */
function mat(name: TunnelMat): Material {
  return (materials[name] ??= partMaterial(name));
}

/** Glass tunnels (humans) or living veins (aliens) between the buildings of a base. */
export class TunnelNet {
  readonly group = new Group();
  private tubes = new Group();
  private walkers = new TunnelWalkers();
  private paths: TunnelPath[] = [];
  private key = '';
  private wait = 0;

  constructor(private map: SurfaceMap) {
    this.group.add(this.tubes, this.walkers.group);
  }

  update(state: GameState, sight: Sight | undefined, dtMs: number): void {
    this.walkers.update(state, this.paths, dtMs);
    this.wait -= dtMs;
    if (this.wait > 0) return;
    this.wait = REFRESH_MS;
    const owners = Object.keys(state.players) as PlayerId[];
    const nets = owners.map((o) => ({ o, list: networkBuildings(state, o, this.map.bodyId) }));
    const key = nets.map((n) => `${n.o}:${n.list.map((e) => e.id).join(',')}`).join('|');
    if (key === this.key) return this.updateShown(sight);
    this.key = key;
    this.tubes.clear();
    this.paths = [];
    for (const { o, list } of nets) {
      const faction = state.players[o]?.faction ?? 'human';
      for (const link of tunnelLinks(list)) this.addTunnel(link, faction, o);
    }
    this.updateShown(sight);
  }

  /** Enemy tunnels only where the player has explored. */
  private updateShown(sight: Sight | undefined): void {
    for (const child of this.tubes.children) {
      const tile = child.userData.tile as number;
      child.visible = child.userData.owner === sight?.me || !sight || sight.explored[tile] === 1;
    }
  }

  private addTunnel({ a, b }: Link, faction: Faction, owner: PlayerId): void {
    const half = this.map.size / 2;
    const [pa, pb] = [a.position, b.position];
    if (!pa || !pb || !a.building || !b.building) return;
    const from = new Vector3(pa.x - half, 0, pa.y - half);
    const to = new Vector3(pb.x - half, 0, pb.y - half);
    const dir = to.clone().sub(from).normalize();
    from.addScaledVector(dir, BUILDINGS[a.building.type].size * 0.45);
    to.addScaledVector(dir, -BUILDINGS[b.building.type].size * 0.45);
    const length = to.distanceTo(from);
    if (length < 0.15 || to.clone().sub(from).dot(dir) <= 0) return;
    const tunnel = faction === 'alien' ? vein(length) : glassTube(length);
    tunnel.position.copy(from).add(to).multiplyScalar(0.5);
    tunnel.quaternion.setFromUnitVectors(FRONT, dir);
    const mid = tunnel.position;
    const tile = Math.floor(mid.z + half) * this.map.size + Math.floor(mid.x + half);
    tunnel.userData = { owner, tile };
    this.tubes.add(tunnel);
    this.paths.push({ owner, faction, from, to, node: tunnel });
  }
}

/** Copies of a 1-tile Blender piece along z, stretched to fill `length`. Materials are shared. */
function pieces(name: 'tunnel' | 'vein', length: number, perTile: number): Group {
  const g = new Group();
  const n = Math.max(1, Math.round(length / perTile));
  for (let i = 0; i < n; i++) {
    const piece = kitModel(name);
    piece.traverse((o) => {
      if (!(o instanceof Mesh)) return;
      o.material = mat(o.userData.kitMat as TunnelMat);
      o.castShadow = o.userData.kitMat !== 'domeGlass';
    });
    piece.scale.z = length / n;
    piece.position.z = -length / 2 + (length * (i + 0.5)) / n;
    g.add(piece);
  }
  return g;
}

/** A glass tube with a steel frame, floor grating and lamps (Blender model 'tunnel'). Runs along z. */
function glassTube(length: number): Group {
  return pieces('tunnel', length, 0.8);
}

/** A living vein with sinews and glowing nodes (Blender model 'vein'). Runs along z. */
function vein(length: number): Group {
  return pieces('vein', length, 1);
}
