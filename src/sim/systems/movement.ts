import type { GameState } from '../state';

/** Moves units along their path. */
export function movementSystem(state: GameState, dtMs: number): void {
  for (const e of [...state.world.with('mover', 'position')]) {
    let budget = (e.mover.speed * dtMs) / 1000;
    while (budget > 0 && e.mover.path.length > 0) {
      const next = e.mover.path[0];
      if (!next) break;
      const dx = next.x - e.position.x;
      const dy = next.y - e.position.y;
      const dist = Math.hypot(dx, dy);
      if (dist <= budget) {
        e.position.x = next.x;
        e.position.y = next.y;
        e.mover.path.shift();
        budget -= dist;
      } else {
        e.position.x += (dx / dist) * budget;
        e.position.y += (dy / dist) * budget;
        budget = 0;
      }
    }
    if (e.mover.path.length === 0) state.world.removeComponent(e, 'mover');
  }
}
