import { describe, expect, it } from 'vitest';
import { runDiplomacy } from './ai/diplomacy';
import { nextTarget } from './ai/targets';
import { createGame } from './game';
import { relationOf, setRelation } from './relations';
import { spawnUnit } from './spawn';
import type { AiId, SideId } from './entity';
import type { GameState } from './state';

const MIN = 60_000;

function game(opponents: number, difficulty: 'easy' | 'normal' = 'normal'): GameState {
  const s = createGame({ seed: 9, faction: 'human', time: 0, opponents, difficulty });
  s.time = 130 * MIN;
  return s;
}

function army(s: GameState, side: SideId, tanks: number): void {
  const zone = s.players[side]?.homeBodyId ?? '';
  for (let i = 0; i < tanks; i++) spawnUnit(s, side, zone, 'tank', { x: 20 + i, y: 20 });
}

function think(s: GameState, id: AiId): void {
  const p = s.players[id];
  const ai = s.ai[id];
  if (!p || !ai) throw new Error('no ai');
  ai.nextTalkAt = 0;
  runDiplomacy(s, p, ai);
}

describe('computer diplomacy', () => {
  it('keeps quiet before the time of the first attacks', () => {
    const s = game(2);
    s.time = 20 * MIN;
    army(s, 'player', 8);
    think(s, 'ai');
    expect(s.offers).toEqual([]);
  });

  it('asks a much stronger enemy for peace when it has two enemies', () => {
    const s = game(2);
    army(s, 'player', 8);
    think(s, 'ai');
    expect(s.offers).toEqual([
      expect.objectContaining({ from: 'ai', to: 'player', kind: 'peace' }),
    ]);
    expect(s.ai.ai?.nextTalkAt).toBeGreaterThan(s.time + 5 * MIN);
  });

  it('two computers make peace and then an alliance against a strong common enemy', () => {
    const s = game(2);
    army(s, 'player', 8);
    think(s, 'ai2');
    expect(relationOf(s, 'ai', 'ai2')).toBe('war');
    setRelation(s, 'ai', 'ai2', 'peace');
    s.time += 6 * MIN;
    think(s, 'ai');
    expect(relationOf(s, 'ai', 'ai2')).toBe('alliance');
  });

  it('declares war when nobody is left to fight, but never breaks an alliance', () => {
    const s = game(2);
    setRelation(s, 'ai', 'ai2', 'peace');
    setRelation(s, 'ai', 'player', 'alliance');
    s.time += 20 * MIN;
    think(s, 'ai');
    expect(relationOf(s, 'ai', 'ai2')).toBe('war');
    expect(relationOf(s, 'ai', 'player')).toBe('alliance');
  });

  it('on easy it never breaks peace with the player', () => {
    const s = game(1, 'easy');
    setRelation(s, 'ai', 'player', 'peace');
    s.time += 30 * MIN;
    think(s, 'ai');
    expect(relationOf(s, 'ai', 'player')).toBe('peace');
  });

  it('attacks its enemies in turns, not only the player', () => {
    const s = game(2);
    const p = s.players.ai;
    const ai = s.ai.ai;
    if (!p || !ai) throw new Error('no ai');
    army(s, 'ai2', 0);
    const opts = { offline: false };
    ai.free = true;
    const first = nextTarget(s, p, ai, opts)?.id;
    ai.waves += 1;
    const second = nextTarget(s, p, ai, opts)?.id;
    expect(new Set([first, second])).toEqual(new Set(['player', 'ai2']));
    expect(nextTarget(s, p, ai, { offline: true })).toBeUndefined();
    setRelation(s, 'ai', 'ai2', 'peace');
    expect(nextTarget(s, p, ai, opts)?.id).toBe('player');
  });
});
