import type { ResearchId } from '../content/research';
import type { PlayerId } from './entity';
import type { GameState } from './state';

export function hasResearch(state: GameState, owner: PlayerId, id: ResearchId): boolean {
  return state.players[owner]?.research.done.includes(id) ?? false;
}
