import { describe, expect, it } from 'vitest';
import { coreOf } from './ai/queries';
import { createGame } from './game';
import { setRelation } from './relations';
import { spawnUnit } from './spawn';
import { dealDamage } from './systems/damage';
import { tick } from './update';
import type { GameState } from './state';
import type { AiId } from './entity';

function threeSides(): GameState {
  return createGame({ seed: 8, faction: 'human', time: 0, opponents: 2 });
}

function destroyCore(s: GameState, side: 'player' | AiId, by?: AiId | 'player'): void {
  const core = coreOf(s, side);
  if (!core) throw new Error('no core');
  const killer = by ? spawnUnit(s, by, core.zone ?? '', 'infantry', { x: 1, y: 1 }) : undefined;
  dealDamage(s, core, 1e6, killer);
}

describe('defeat and victory with many sides', () => {
  it('a side without its main dome is out; its things fall apart; the game goes on', () => {
    const s = threeSides();
    destroyCore(s, 'ai', 'player');
    expect(s.players.ai?.defeated).toBe(true);
    expect(s.winner).toBeUndefined();
    expect(s.events.at(-1)?.text).toContain('ist besiegt');
    tick(s);
    expect(s.world.entities.some((e) => e.owner === 'ai')).toBe(false);
    expect(s.marks.some((m) => m.owner === 'ai' && m.kind === 'unit')).toBe(true);
    destroyCore(s, 'ai2', 'player');
    expect(s.winner).toBe('player');
  });

  it('you win together with your allies', () => {
    const s = threeSides();
    setRelation(s, 'player', 'ai2', 'alliance');
    destroyCore(s, 'ai', 'ai2');
    expect(s.winner).toBe('player');
  });

  it('a side at peace must still be beaten (or become an ally)', () => {
    const s = threeSides();
    setRelation(s, 'player', 'ai2', 'peace');
    destroyCore(s, 'ai', 'player');
    expect(s.winner).toBeUndefined();
  });

  it('the side that destroys your main dome wins', () => {
    const s = threeSides();
    destroyCore(s, 'player', 'ai2');
    expect(s.winner).toBe('ai2');
    expect(s.players.player?.defeated).toBe(true);
    tick(s);
    expect(s.world.entities.some((e) => e.owner === 'player')).toBe(true);
  });

  it('computer sides that are out stop thinking', () => {
    const s = threeSides();
    destroyCore(s, 'ai', 'ai2');
    tick(s);
    const before = s.ai.ai?.nextThinkAt;
    for (let i = 0; i < 100; i++) tick(s);
    expect(s.ai.ai?.nextThinkAt).toBe(before);
  });
});
