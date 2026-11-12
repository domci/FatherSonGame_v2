import { describe, expect, it } from 'vitest';
import { createGame } from '../sim/game';
import { setRelation } from '../sim/relations';
import { spawnUnit } from '../sim/spawn';
import { ownerLabel, relationLabel, strengthWord } from './panel-peoples';

describe('peoples window texts', () => {
  it('names relations and colors from the player view', () => {
    const s = createGame({ seed: 2, faction: 'human', time: 0, opponents: 3 });
    setRelation(s, 'player', 'ai2', 'alliance');
    setRelation(s, 'player', 'ai3', 'peace');
    expect(relationLabel(s, 'ai')).toEqual({ name: 'Krieg', color: '#ff5d6c' });
    expect(relationLabel(s, 'ai2').name).toBe('Bündnis');
    expect(ownerLabel(s, 'ai3', 'Einheit')).toBe(`Frieden: ${s.players.ai3?.name}`);
    expect(ownerLabel(s, 'player', 'Einheit')).toBe('Einheit');
    expect(ownerLabel(s, 'wild', 'Einheit')).toBe('Wildes Tier');
    const p = s.players.ai;
    if (p) p.defeated = true;
    expect(relationLabel(s, 'ai').name).toBe('Besiegt');
  });

  it('compares the army strength with the player', () => {
    const s = createGame({ seed: 2, faction: 'human', time: 0, opponents: 1 });
    expect(strengthWord(s, 'ai')).toBe('etwa so stark wie ihr');
    const home = s.players.ai?.homeBodyId ?? '';
    for (let i = 0; i < 6; i++) spawnUnit(s, 'ai', home, 'tank', { x: 20 + i, y: 20 });
    expect(strengthWord(s, 'ai')).toBe('stärker als ihr');
  });
});
