import { describe, expect, it } from 'vitest';
import { applyCommand } from '../commands';
import { freeSpot, homeZone, newTestGame } from '../test-helpers';
import { tick } from '../update';
import { fromSaveData, toSaveData } from './save';

describe('save and load', () => {
  it('gives the same game after loading', () => {
    const s = newTestGame(11);
    const spot = freeSpot(s, 'solarField');
    applyCommand(s, {
      type: 'build',
      player: 'player',
      zone: homeZone(s),
      building: 'solarField',
      ...spot,
    });
    for (let i = 0; i < 50; i++) tick(s);
    const json = JSON.stringify(toSaveData(s, 123));
    const loaded = fromSaveData(JSON.parse(json));
    expect(loaded.time).toBe(s.time);
    expect(loaded.players).toEqual(s.players);
    expect(loaded.world.entities).toEqual(s.world.entities);
    expect(loaded.system).toEqual(s.system);
    expect(loaded.surfaces).toEqual(s.surfaces);
  });

  it('continues exactly like the original', () => {
    const s = newTestGame(12);
    for (let i = 0; i < 100; i++) tick(s);
    const copy = fromSaveData(JSON.parse(JSON.stringify(toSaveData(s, 0))));
    for (let i = 0; i < 300; i++) {
      tick(s);
      tick(copy);
    }
    expect(JSON.stringify(copy.world.entities)).toBe(JSON.stringify(s.world.entities));
  });

  it('rejects broken or too new data', () => {
    expect(() => fromSaveData(null)).toThrow('Kein gültiger Spielstand.');
    expect(() => fromSaveData({ version: 999 })).toThrow('neueren Version');
    expect(() => fromSaveData({ version: 0 })).toThrow('Keine Migration');
  });
});
