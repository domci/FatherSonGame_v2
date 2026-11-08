import type { PerspectiveCamera, Scene, Vector2 } from 'three/webgpu';
import type { GameState } from '../../sim/state';
import type { BuildingId } from '../../content/buildings';

export type ViewName = 'surface' | 'planet' | 'system';

export type Pick =
  | { kind: 'entity'; id: number }
  | { kind: 'ground'; x: number; y: number }
  | { kind: 'body'; id: string };

/** What the render layer needs to know from the UI (selection, placement preview). */
export interface ViewUi {
  selectedIds: ReadonlySet<number>;
  selectedBodyId?: string;
  ghost?: {
    type: BuildingId;
    tileX: number;
    tileY: number;
    ok: boolean;
  };
}

export interface View {
  name: ViewName;
  scene: Scene;
  camera: PerspectiveCamera;
  update(state: GameState, ui: ViewUi, dtMs: number): void;
  pick(state: GameState, ndc: Vector2): Pick | null;
  setEnabled(enabled: boolean): void;
  resize(aspect: number): void;
  /** Camera distance as 0 (closest) .. 1 (farthest). Used to switch views. */
  zoomLevel(): number;
  /** Puts the camera at the near (0) or far (1) end of its zoom range. */
  resetZoom(at: 0 | 1): void;
}
