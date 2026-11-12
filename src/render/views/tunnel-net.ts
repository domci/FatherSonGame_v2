import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  SphereGeometry,
  TorusGeometry,
  Vector3,
  type Material,
} from 'three/webgpu';
import { BUILDINGS } from '../../content/buildings';
import type { Faction } from '../../content/factions';
import type { Entity, PlayerId } from '../../sim/entity';
import type { SurfaceMap } from '../../sim/generation/surface';
import type { GameState } from '../../sim/state';
import { boxOf, gapBetween, networkBuildings, TUNNEL_REACH } from '../../sim/tunnels';
import { partMaterial } from '../models/parts';
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

const shared = {
  tube: new CylinderGeometry(0.2, 0.2, 1, 16, 1, true),
  rib: new TorusGeometry(0.21, 0.028, 6, 20),
  floor: new BoxGeometry(0.3, 0.04, 1),
  vein: new CylinderGeometry(0.13, 0.13, 1, 10),
  bulb: new SphereGeometry(0.18, 12, 8),
};

const materials: Partial<Record<string, Material>> = {};
function mat(name: 'domeGlass' | 'steel' | 'dark' | 'fleshDark' | 'glowGreen'): Material {
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

/** A glass tube on the ground with steel rings and a dark floor. Runs along z. */
function glassTube(length: number): Group {
  const g = new Group();
  const tube = new Mesh(shared.tube, mat('domeGlass'));
  tube.rotation.x = Math.PI / 2;
  tube.scale.y = length;
  tube.position.y = 0.2;
  const floor = new Mesh(shared.floor, mat('dark'));
  floor.scale.z = length;
  floor.position.y = 0.04;
  floor.receiveShadow = true;
  g.add(tube, floor);
  const rings = Math.max(2, Math.round(length / 0.7));
  for (let i = 0; i < rings; i++) {
    const ring = new Mesh(shared.rib, mat('steel'));
    ring.position.set(0, 0.2, -length / 2 + (length * (i + 0.5)) / rings);
    ring.castShadow = true;
    g.add(ring);
  }
  return g;
}

/** A living vein with glowing bulbs (aliens). Runs along z. */
function vein(length: number): Group {
  const g = new Group();
  const tube = new Mesh(shared.vein, mat('fleshDark'));
  tube.rotation.x = Math.PI / 2;
  tube.scale.y = length;
  tube.position.y = 0.11;
  tube.castShadow = true;
  g.add(tube);
  const bulbs = Math.max(1, Math.round(length / 1.4));
  for (let i = 0; i < bulbs; i++) {
    const bulb = new Mesh(shared.bulb, mat(i % 2 ? 'glowGreen' : 'fleshDark'));
    bulb.position.set(0, 0.12, -length / 2 + (length * (i + 0.5)) / bulbs);
    bulb.scale.set(1, 0.7, 1.3);
    g.add(bulb);
  }
  return g;
}
