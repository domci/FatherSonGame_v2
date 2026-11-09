import { describe, expect, it } from 'vitest';
import { applyCommand } from './commands';
import { spawnUnit } from './spawn';
import { homeZone, newTestGame } from './test-helpers';
import { tick } from './update';
import type { GameState } from './state';

function runTicks(s: GameState, n: number): void {
  for (let i = 0; i < n; i++) tick(s);
}

function arena(): { s: GameState; zone: string; c: number } {
  const s = newTestGame();
  s.players.ai = { ...s.players.player!, id: 'ai', faction: 'alien', research: { done: [] } };
  for (const nest of s.world.with('nest').entities) s.world.remove(nest);
  return { s, zone: homeZone(s), c: s.surfaces[homeZone(s)]!.size / 2 };
}

describe('base guard', () => {
  it('soldiers at home go to attackers near the base, ordered soldiers keep their order', () => {
    const { s, zone, c } = arena();
    const guard = spawnUnit(s, 'player', zone, 'infantry', { x: c - 14, y: c });
    const busy = spawnUnit(s, 'player', zone, 'infantry', { x: c - 14, y: c + 2 });
    applyCommand(s, { type: 'move', player: 'player', unitIds: [busy.id], target: { x: 2, y: 2 } });
    const raider = spawnUnit(s, 'ai', zone, 'infantry', { x: c + 8, y: c + 1 });
    raider.health!.hp = 5000;
    runTicks(s, 15);
    expect(guard.mover?.attackMove).toBe(true);
    const before = Math.hypot(guard.position!.x - raider.position!.x, guard.position!.y - c);
    runTicks(s, 30);
    const after = Math.hypot(guard.position!.x - raider.position!.x, guard.position!.y - c);
    expect(after).toBeLessThan(before);
    expect(busy.mover?.attackMove).toBeFalsy();
  });
});
