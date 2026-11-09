import type { GameState } from '../sim/state';

/** Where the camera looks first on a surface: own ship or troops there, else the own core. */
export function focusPoint(state: GameState, zone: string): { x: number; y: number } | undefined {
  let best: { x: number; y: number } | undefined;
  for (const e of state.world.with('position')) {
    if (e.owner !== 'player' || e.zone !== zone || e.aboard) continue;
    if (e.building?.type === 'commandDome' || e.unit?.type === 'transport') return e.position;
    best ??= e.position;
  }
  return best;
}
