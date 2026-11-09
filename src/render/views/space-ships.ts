import { Group, type Object3D } from 'three/webgpu';
import type { GameState } from '../../sim/state';
import { unitModel } from '../models/unit-models';
import { shipPose } from './ship-path';

/** Ships flying between planets (system scale). */
export class SpaceShips {
  readonly group = new Group();
  private ships = new Map<number, Object3D>();

  update(state: GameState): void {
    const seen = new Set<number>();
    for (const ship of state.world.with('ship')) {
      const pose = shipPose(state, ship);
      if (!pose) continue;
      seen.add(ship.id);
      let obj = this.ships.get(ship.id);
      if (!obj) {
        obj = unitModel('miningShip');
        this.ships.set(ship.id, obj);
        this.group.add(obj);
      }
      obj.position.set(pose.x, 0.8, pose.y);
      obj.rotation.y = pose.angle;
    }
    for (const [id, obj] of this.ships) {
      if (seen.has(id)) continue;
      this.group.remove(obj);
      this.ships.delete(id);
    }
  }
}
