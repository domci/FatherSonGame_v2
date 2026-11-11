import { describe, expect, it } from 'vitest';
import { MIN_PEOPLE, NEEDS_PER_PERSON, START_PEOPLE } from '../content/colony';
import { MINUTE } from './clock';
import { moodParts, workFactor } from './colony';
import { spawnBuilding } from './spawn';
import { playerStats } from './stats';
import { colonySystem } from './systems/colony';
import { productionSystem } from './systems/production';
import { freeSpot, homeZone, newTestGame } from './test-helpers';
import { catchUp } from './update';
import type { BuildingId } from '../content/buildings';
import type { GameState } from './state';

function add(s: GameState, type: BuildingId, level = 1): void {
  spawnBuilding(s, 'player', homeZone(s), { type, ...freeSpot(s, type), level });
}

function me(s: GameState) {
  const p = s.players.player;
  if (!p) throw new Error('no player');
  return p;
}

/** Lots of everything, so nobody misses anything. */
function plenty(s: GameState): void {
  Object.assign(me(s).resources, { oxygen: 900, water: 900, food: 900 });
}

describe('people in the domes', () => {
  it('start with 8 people who breathe, drink and eat', () => {
    const s = newTestGame();
    plenty(s);
    expect(me(s).colony.people).toBe(START_PEOPLE);
    colonySystem(s, MINUTE);
    expect(me(s).resources.oxygen).toBeCloseTo(900 - START_PEOPLE * NEEDS_PER_PERSON.oxygen);
    expect(me(s).resources.water).toBeCloseTo(900 - START_PEOPLE * NEEDS_PER_PERSON.water);
    expect(me(s).resources.food).toBeCloseTo(900 - START_PEOPLE * NEEDS_PER_PERSON.food);
  });

  it('get sick and unhappy without air, and the player is told once', () => {
    const s = newTestGame();
    plenty(s);
    me(s).resources.oxygen = 0;
    for (let i = 0; i < 10; i++) colonySystem(s, MINUTE);
    const c = me(s).colony;
    expect(c.sick).toBeGreaterThan(1);
    expect(c.mood).toBeLessThan(50);
    expect(s.events.filter((e) => e.text.includes('Kein Sauerstoff'))).toHaveLength(1);
  });

  it('work in the buildings: too few people = slower production, but never below 25 %', () => {
    const s = newTestGame();
    for (let i = 0; i < 6; i++) add(s, 'regolithExcavator');
    const c = me(s).colony;
    const stats = playerStats(s, 'player');
    expect(stats.jobs).toBe(12);
    expect(workFactor(c, stats)).toBeLessThan(1);
    c.sick = c.people;
    expect(workFactor(c, stats)).toBeCloseTo(0.25);
    const before = me(s).resources.regolith ?? 0;
    productionSystem(s, MINUTE);
    const made = (me(s).resources.regolith ?? 0) - before;
    expect(made).toBeCloseTo(6 * 30 * 0.25 * playerStats(s, 'player').efficiency);
  });

  it('grow when they are happy and there is room', () => {
    const s = newTestGame();
    plenty(s);
    add(s, 'habitatDome');
    me(s).colony.mood = 85;
    for (let i = 0; i < 30; i++) colonySystem(s, MINUTE);
    expect(me(s).colony.people).toBeGreaterThan(START_PEOPLE + 3);
    expect(me(s).colony.people).toBeLessThanOrEqual(playerStats(s, 'player').residents);
  });

  it('leave when they are unhappy, but never below 2', () => {
    const s = newTestGame();
    Object.assign(me(s).resources, { oxygen: 0, water: 0, food: 0 });
    for (let i = 0; i < 240; i++) colonySystem(s, MINUTE);
    expect(me(s).colony.people).toBe(MIN_PEOPLE);
    expect(s.events.some((e) => e.text.includes('verlassen'))).toBe(true);
  });

  it('a medical station heals, a park makes them happier', () => {
    const s = newTestGame();
    plenty(s);
    me(s).colony.sick = 6;
    const without = moodParts(me(s).colony, playerStats(s, 'player'));
    add(s, 'medbay');
    add(s, 'park');
    const stats = playerStats(s, 'player');
    expect(moodParts(me(s).colony, stats).find((p) => p.text === 'Parks')?.value).toBeGreaterThan(
      0,
    );
    expect(without.some((p) => p.text === 'Parks')).toBe(false);
    for (let i = 0; i < 3; i++) colonySystem(s, MINUTE);
    expect(me(s).colony.sick).toBeLessThan(6 - 2.5);
  });

  it('keep living while the game is closed', () => {
    const s = newTestGame();
    plenty(s);
    add(s, 'habitatDome');
    me(s).colony.mood = 85;
    catchUp(s, 60 * MINUTE);
    expect(me(s).colony.people).toBeGreaterThan(START_PEOPLE);
  });
});
