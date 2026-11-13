import type { SideId } from '../sim/entity';
import { viewerHome, viewerOf } from '../sim/viewer';
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
  panel?: PanelName;
}

/** Windows that are not about a selected thing. */
export type PanelName = 'colony' | 'peoples';

/** Online: commands go to the world server, which runs the game (M7). */
export interface CommandLink {
  send(cmd: Command): void;
}

/** One running game in the browser: state + UI selection + saving. */
export class Session {
  ui: UiState;
  speed: Speed = 1;
  /** Listeners for messages (toasts). */
  onMessage: (text: string, kind: 'info' | 'good' | 'bad') => void = () => undefined;
  /** Shows a planet's surface (set by the game app). */
  goZone: (zone: string) => void = () => undefined;

  constructor(
    public state: GameState,
    /** Set in online worlds. */
    readonly net?: CommandLink,
  ) {
    this.ui = {
      selectedIds: new Set(),
      view: 'surface',
      faction: state.players[viewerOf(state)]?.faction ?? 'human',
      zone: viewerHome(state),
    };
  }

  /** The side this device plays (see sim/viewer.ts). */
  get me(): SideId {
    return viewerOf(this.state);
  }

  /** Online the server checks the command; a problem comes back later as a message. */
  command(cmd: Command): boolean {
    if (this.net) {
      this.net.send(cmd);
      return true;
    }
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
  openPanel(panel: PanelName): void {
    this.select([]);
    this.ui.panel = panel;
  }

  startPlacing(type: BuildingId | undefined): void {
    this.ui.placing = type;
    if (!type) delete this.ui.ghost;
    this.select([]);
  }

  /** Online worlds are saved by the server. */
  async save(): Promise<void> {
    if (this.net) return;
    await writeSave(toSaveData(this.state, Date.now()));
  }
}
