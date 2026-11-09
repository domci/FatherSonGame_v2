import { Group, Mesh, BoxGeometry, MeshBasicNodeMaterial } from 'three/webgpu';
import { BUILDINGS, type BuildingId } from '../../content/buildings';
import type { Faction } from '../../content/factions';
import type { SurfaceMap } from '../../sim/generation/surface';
import { visualHeight } from '../terrain-shape';
import { buildModel } from '../models/parts';
import { buildingParts } from '../models/building-models';
import type { ViewUi } from './view';

/** See-through preview of a building before it is placed. Green = ok, red = not ok. */
export class Ghost {
  readonly group = new Group();
  private type?: BuildingId;
  private box = new Mesh(
    new BoxGeometry(1, 0.1, 1),
    new MeshBasicNodeMaterial({ transparent: true, opacity: 0.45 }),
  );

  constructor() {
    this.group.add(this.box);
    this.group.visible = false;
  }

  faction: Faction = 'human';

  update(map: SurfaceMap, ghost: ViewUi['ghost']): void {
    this.group.visible = !!ghost;
    if (!ghost) return;
    if (ghost.type !== this.type) this.rebuild(ghost.type);
    const size = BUILDINGS[ghost.type].size;
    const cx = ghost.tileX + size / 2;
    const cy = ghost.tileY + size / 2;
    this.group.position.set(cx - map.size / 2, visualHeight(map, cx, cy) + 0.05, cy - map.size / 2);
    this.box.scale.set(size, 1, size);
    const mat = this.box.material;
    if (mat instanceof MeshBasicNodeMaterial) mat.color.set(ghost.ok ? 0x4cff7a : 0xff4c4c);
  }

  private rebuild(type: BuildingId): void {
    this.type = type;
    for (const child of [...this.group.children]) if (child !== this.box) this.group.remove(child);
    const model = buildModel(buildingParts(type, this.faction));
    model.traverse((o) => {
      if (o instanceof Mesh) {
        o.material = new MeshBasicNodeMaterial({
          color: 0xaad4ff,
          transparent: true,
          opacity: 0.35,
        });
        o.castShadow = false;
      }
    });
    this.group.add(model);
  }
}
