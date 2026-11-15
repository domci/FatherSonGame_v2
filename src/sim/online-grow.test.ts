import { describe, expect, it } from 'vitest';
import { ONLINE } from '../content/online';
import { applyCommand } from './commands';
import { digest } from '../net/digest';
import { findBody } from './generation/solar-system';
import { createOnlineWorld, freeSeats } from './online';
import { relationOf, sidesOf } from './relations';
import { fromSaveData, toSaveData } from './save/save';
import type { GameState } from './state';
import { tick } from './update';

const T0 = 1_700_000_000_000;

/** The maker and one more person, no computers: 2 planets at the start. */
function small(): GameState {
  return createOnlineWorld({
    seed: 11,
    time: T0,
    faction: 'human',
    name: 'Roter Falke',
    difficulty: 'easy',
    computers: 0,
    people: 2,
  });
}

function joinNext(s: GameState, name: string): string {
  const seat = freeSeats(s)[0];
  if (!seat) throw new Error('full');
  expect(applyCommand(s, { type: 'join', player: seat, faction: 'alien', name }).ok).toBe(true);
  return seat;
}

describe('online worlds grow (more people, more planets)', () => {
  it('adds a home planet when all places are taken', () => {
    const s = small();
    joinNext(s, 'Blauer Komet');
    expect(s.system.homes).toHaveLength(2);
    const seat = joinNext(s, 'Grüner Stern');
    expect(seat).toBe('s2');
    expect(s.system.homes).toHaveLength(3);
    expect(s.settings.extraHomes).toBe(1);
    const p = s.players.s2;
    expect(p?.homeBodyId).toBe(s.system.homes[2]);
    expect(p?.name).toBe('Grüner Stern');
    expect(s.surfaces[p?.homeBodyId ?? '']).toBeDefined();
    expect(sidesOf(s)).toEqual(['player', 'ai', 's2']);
    expect(relationOf(s, 'player', 's2')).toBe('peace');
    expect(p?.color).not.toBe(s.players.player?.color);
  });

  it('puts the new planet on the orbit of a home planet (same sunlight), at another place', () => {
    const s = small();
    joinNext(s, 'A');
    joinNext(s, 'B');
    const added = findBody(s.system, s.system.homes[2] ?? '');
    const twin = s.system.bodies.find((b) => b !== added && b.orbitRadius === added?.orbitRadius);
    expect(added?.kind).toBe('rocky');
    expect(twin && s.system.homes.includes(twin.id)).toBe(true);
    expect(added?.orbitPeriod).toBe(twin?.orbitPeriod);
    expect(added?.solarFactor).toBe(twin?.solarFactor);
    expect(added?.phase).not.toBeCloseTo(twin?.phase ?? 0, 1);
    expect(new Set(s.system.bodies.map((b) => b.id)).size).toBe(s.system.bodies.length);
    expect(new Set(s.system.bodies.map((b) => b.name)).size).toBe(s.system.bodies.length);
  });

  it('keeps added planets in the save, and replays the same', () => {
    const s = small();
    joinNext(s, 'A');
    joinNext(s, 'B');
    joinNext(s, 'C');
    for (let i = 0; i < 50; i++) tick(s);
    const loaded = fromSaveData(toSaveData(s, T0));
    expect(loaded.system.homes).toEqual(s.system.homes);
    expect(loaded.system.bodies).toEqual(s.system.bodies);
    const again = fromSaveData(toSaveData(s, T0));
    for (let i = 0; i < 50; i++) {
      tick(loaded);
      tick(again);
    }
    expect(digest(loaded)).toBe(digest(again));
  });

  it('stops growing at the most sides; a seat that was left is free again', () => {
    const s = small();
    while (freeSeats(s).length > 0) joinNext(s, 'X');
    expect(sidesOf(s)).toHaveLength(ONLINE.maxGrownSides);
    expect(s.system.homes).toHaveLength(ONLINE.maxGrownSides);
    expect(applyCommand(s, { type: 'leave', player: 's5' }).ok).toBe(true);
    expect(freeSeats(s)).toEqual(['s5']);
    expect(joinNext(s, 'Y')).toBe('s5');
    expect(s.system.homes).toHaveLength(ONLINE.maxGrownSides);
  });
});
