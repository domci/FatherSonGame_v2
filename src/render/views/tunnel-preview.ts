import { CylinderGeometry, Mesh, Vector3 } from 'three/webgpu';
import { BUILDINGS } from '../../content/buildings';
import type { SurfaceMap } from '../../sim/generation/surface';
import type { GameState } from '../../sim/state';
import { boxOf, gapBetween, needsTunnel, networkBuildings, TUNNEL_REACH } from '../../sim/tunnels';
import { solidMaterial } from '../materials';
import type { ViewUi } from './view';

const OK = solidMaterial(0x7cff6b, { glow: 1.6 });
const BAD = solidMaterial(0xff5d6c, { glow: 1.6 });
const FRONT = new Vector3(0, 1, 0);

/** While placing: a thin line from the new building to the nearest one (green = tunnel fits). */
export class TunnelPreview {
  readonly mesh = new Mesh(new CylinderGeometry(0.07, 0.07, 1, 8), OK);

  constructor(private map: SurfaceMap) {
    this.mesh.visible = false;
  }

  update(state: GameState, ghost: ViewUi['ghost']): void {
    this.mesh.visible = false;
    if (!ghost || !needsTunnel(ghost.type)) return;
    const size = BUILDINGS[ghost.type].size;
    const box = { x: ghost.tileX, y: ghost.tileY, size };
    let best: { gap: number; x: number; y: number } | undefined;
    for (const b of networkBuildings(state, 'player', this.map.bodyId)) {
      const other = boxOf(b);
      if (!other || !b.position) continue;
      const gap = gapBetween(box, other);
      if (!best || gap < best.gap) best = { gap, ...b.position };
    }
    if (!best) return;
    const half = this.map.size / 2;
    const from = new Vector3(ghost.tileX + size / 2 - half, 0.3, ghost.tileY + size / 2 - half);
    const to = new Vector3(best.x - half, 0.3, best.y - half);
    const length = from.distanceTo(to);
    if (length < 0.1) return;
    this.mesh.visible = true;
    this.mesh.material = best.gap <= TUNNEL_REACH ? OK : BAD;
    this.mesh.position.copy(from).add(to).multiplyScalar(0.5);
    this.mesh.scale.set(1, length, 1);
    this.mesh.quaternion.setFromUnitVectors(FRONT, to.sub(from).normalize());
  }
}
