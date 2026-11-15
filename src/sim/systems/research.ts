import { RESEARCH } from '../../content/research';
import { tell } from '../humans';
import type { GameState } from '../state';
import { L, fmt } from '../../content/text';

export function researchSystem(state: GameState): void {
  for (const player of Object.values(state.players)) {
    const current = player?.research.current;
    if (!player || !current || current.finishAt > state.time) continue;
    player.research.done.push(current.id);
    delete player.research.current;
    tell(
      state,
      player.id,
      fmt(L('Forschung fertig: {r}.', 'Research done: {r}.'), { r: RESEARCH[current.id].name }),
      'good',
    );
  }
}
