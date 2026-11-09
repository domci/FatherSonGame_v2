import type { PlayerId } from '../../sim/entity';
import type { GameState } from '../../sim/state';
import { visibleTiles } from '../../sim/visibility';
import { playerStats } from '../../sim/stats';
import type { Sight } from './surface-entities';

const REFRESH_MS = 200;

function decode(text: string, size: number): Uint8Array {
  const out = new Uint8Array(size);
  for (let i = 0; i < size && i < text.length; i++) out[i] = text.charCodeAt(i) === 49 ? 1 : 0;
  return out;
}

/**
 * What the player sees on one surface. Read-only: the sim keeps the explored map,
 * the view only merges it with what is in sight now.
 */
export class SightTracker {
  private sight?: Sight;
  private wait = 0;
  private exploredText = '';
  private explored: Uint8Array = new Uint8Array(0);

  constructor(private zone: string) {}

  update(state: GameState, dtMs: number): Sight {
    this.wait -= dtMs;
    if (this.sight && this.wait > 0) return this.sight;
    this.wait = REFRESH_MS;
    const visible = visibleTiles(state, 'player', this.zone);
    const text = state.players.player?.explored?.[this.zone] ?? '';
    if (text !== this.exploredText || this.explored.length !== visible.length) {
      this.exploredText = text;
      this.explored = decode(text, visible.length);
    }
    const explored = this.explored.map((v, i) => v | (visible[i] ?? 0));
    this.explored = explored;
    this.sight = { visible, explored, powered: poweredOwners(state) };
    return this.sight;
  }
}

/** Owners whose buildings have full energy (shields and force fields work). */
export function poweredOwners(state: GameState): Set<PlayerId> {
  const out = new Set<PlayerId>();
  for (const id of Object.keys(state.players) as PlayerId[])
    if (playerStats(state, id).efficiency >= 1) out.add(id);
  return out;
}
