import { RESEARCH } from '../../content/research';
import { addEvent } from '../game';
import type { GameState } from '../state';

export function researchSystem(state: GameState): void {
  for (const player of Object.values(state.players)) {
    const current = player?.research.current;
    if (!player || !current || current.finishAt > state.time) continue;
    player.research.done.push(current.id);
    delete player.research.current;
    if (player.id === 'player')
      addEvent(state, `Forschung fertig: ${RESEARCH[current.id].name}.`, 'good');
  }
}
