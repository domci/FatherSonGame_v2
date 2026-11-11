import type { BuildingId } from '../content/buildings';
import { applyCommand, type Command } from '../sim/commands';
import type { GameState } from '../sim/state';
import { toSaveData } from '../sim/save/save';
import { writeSave } from '../platform/storage';
import type { ViewName } from '../render/views/view';
import type { Faction } from '../content/factions';

export type Speed = 1 | 10 | 100;

/** Everything the player is doing right now that is not part of the game rules. */
export interface UiState {
  selectedIds: Set<number>;
  selectedBodyId?: string;
  placing?: BuildingId;
  ghost?: { type: BuildingId; tileX: number; tileY: number; ok: boolean };
  view: ViewName;
  /** People of the player. */
  faction: Faction;
  /** The planet surface the player looks at. */
  zone: string;
  /** Touch: the next drag draws a selection box. */
  boxMode?: boolean;
  /** A window that is not about a selected thing. */
  panel?: 'colony';
}

/** One running game in the browser: state + UI selection + saving. */
export class Session {
  ui: UiState;
  speed: Speed = 1;
  /** Listeners for messages (toasts). */
  onMessage: (text: string, kind: 'info' | 'good' | 'bad') => void = () => undefined;
  /** Shows a planet's surface (set by the game app). */
  goZone: (zone: string) => void = () => undefined;

  constructor(public state: GameState) {
    this.ui = {
      selectedIds: new Set(),
      view: 'surface',
      faction: state.players.player?.faction ?? 'human',
      zone: state.system.homeBodyId,
    };
  }

  command(cmd: Command): boolean {
    const result = applyCommand(this.state, cmd);
    if (!result.ok) this.onMessage(result.reason, 'bad');
    return result.ok;
  }

  select(ids: number[]): void {
    this.ui.selectedIds = new Set(ids);
    delete this.ui.selectedBodyId;
    delete this.ui.panel;
  }

  /** Opens a window like the colony window (and clears the selection). */
  openPanel(panel: 'colony'): void {
    this.select([]);
    this.ui.panel = panel;
  }

  startPlacing(type: BuildingId | undefined): void {
    this.ui.placing = type;
    if (!type) delete this.ui.ghost;
    this.select([]);
  }

  async save(): Promise<void> {
    await writeSave(toSaveData(this.state, Date.now()));
  }
}
