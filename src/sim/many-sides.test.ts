import { describe, expect, it } from 'vitest';
import { AI_TUNING } from '../content/ai';
import { createGame } from './game';
import { generateSolarSystem } from './generation/solar-system';
import { sidesOf } from './relations';

describe('many peoples (M6)', () => {
  it('makes the same system as before for one enemy', () => {
    for (const seed of [1, 7, 42, 1234]) {
      const old = generateSolarSystem(seed);
      const two = generateSolarSystem(seed, 2);
      expect(two).toEqual(old);
      expect(old.homes).toEqual([old.homeBodyId, old.alienBodyId]);
    }
  });

  it('gives every side its own rocky home planet', () => {
    for (const seed of [1, 7, 42, 1234]) {
      const system = generateSolarSystem(seed, 4);
      expect(system.homes).toHaveLength(4);
      expect(new Set(system.homes).size).toBe(4);
      expect(system.homes[0]).toBe(system.homeBodyId);
      for (const id of system.homes)
        expect(system.bodies.find((b) => b.id === id)?.kind).toBe('rocky');
      expect(system.bodies.some((b) => b.kind === 'gas')).toBe(true);
    }
  });

  it('starts a game with three computer sides, each with a base, name and color', () => {
    const s = createGame({ seed: 5, faction: 'human', time: 0, opponents: 3 });
    expect(sidesOf(s)).toEqual(['player', 'ai', 'ai2', 'ai3']);
    const ais = [s.players.ai, s.players.ai2, s.players.ai3];
    expect(ais.map((p) => p?.faction)).toEqual(['alien', 'human', 'alien']);
    expect(new Set(ais.map((p) => p?.name)).size).toBe(3);
    expect(new Set(ais.map((p) => p?.color)).size).toBe(3);
    expect(new Set(ais.map((p) => p?.homeBodyId)).size).toBe(3);
    for (const p of ais) {
      const core = s.world.entities.find(
        (e) => e.owner === p?.id && e.building?.type === 'commandDome',
      );
      expect(core?.zone).toBe(p?.homeBodyId);
    }
    const first = AI_TUNING.normal.firstAttackMs;
    expect(s.ai.ai?.nextAttackAt).toBe(first);
    expect(s.ai.ai3?.nextAttackAt).toBeGreaterThan(s.ai.ai2?.nextAttackAt ?? Infinity);
    expect(s.ai.ai2?.nextAttackAt).toBeGreaterThan(first);
  });

  it('starts with everybody at war', () => {
    const s = createGame({ seed: 5, faction: 'alien', time: 0, opponents: 2 });
    expect(s.relations).toEqual({});
    expect(s.players.ai?.faction).toBe('human');
    expect(s.players.ai2?.faction).toBe('alien');
  });
});
