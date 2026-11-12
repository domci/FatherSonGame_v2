import { describe, expect, it } from 'vitest';
import { createGame } from '../game';
import { setRelation } from '../relations';
import { newBattleGame } from '../test-helpers';
import { fromSaveData, toSaveData } from './save';

describe('save and load with many peoples (M6)', () => {
  it('keeps three computer sides, their planets and the relations', () => {
    const s = createGame({ seed: 21, faction: 'alien', time: 0, opponents: 3 });
    setRelation(s, 'player', 'ai2', 'peace');
    s.offers.push({ from: 'ai3', to: 'player', kind: 'peace', until: 99_999 });
    const loaded = fromSaveData(JSON.parse(JSON.stringify(toSaveData(s, 0))));
    expect(loaded.system).toEqual(s.system);
    expect(loaded.players).toEqual(s.players);
    expect(loaded.relations).toEqual(s.relations);
    expect(loaded.offers).toEqual(s.offers);
    expect(loaded.world.entities.length).toBe(s.world.entities.length);
  });

  it('loads a save from before M6 (version 3): one enemy, names, colors, all at war', () => {
    const s = newBattleGame(22);
    const old = JSON.parse(JSON.stringify({ ...toSaveData(s, 0), version: 3 })) as {
      settings: Record<string, unknown>;
      players: Record<string, Record<string, unknown>>;
      relations?: unknown;
      offers?: unknown;
    };
    delete old.settings.opponents;
    delete old.relations;
    delete old.offers;
    for (const p of Object.values(old.players)) {
      delete p.name;
      delete p.color;
    }
    const loaded = fromSaveData(old);
    expect(loaded.settings.opponents).toBe(1);
    expect(loaded.players.player?.name).toBe('Ihr');
    expect(loaded.players.ai?.name).toBe('Schwarm Xar');
    expect(loaded.players.ai?.color).toBe('#ff5d6c');
    expect(loaded.relations).toEqual({});
    expect(loaded.offers).toEqual([]);
    expect(loaded.system).toEqual(s.system);
    expect(loaded.players.ai2).toBeUndefined();
  });
});
