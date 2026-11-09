import { describe, expect, it } from 'vitest';
import { HOUR, MINUTE } from './clock';
import { buildingsOf, unitsOf } from './ai/queries';
import { findBuildSpot } from './ai/placement';
import { newBattleGame } from './test-helpers';
import { createGame } from './game';
import { catchUp } from './catch-up';
import { economyStep, liveStep } from './update';
import type { GameState } from './state';
import { progressOf } from './ai/strength';
import { AI_TUNING } from '../content/ai';

function play(s: GameState, ms: number, step = 5000): void {
  for (let t = 0; t < ms; t += step) {
    economyStep(s, step);
    liveStep(s, step);
  }
}

/** A computer plays the player side too (a busy human), but never attacks. */
function playerBot(s: GameState): GameState {
  s.ai.player = { nextThinkAt: 0, nextAttackAt: Infinity, waves: 0, free: true };
  return s;
}

describe('computer enemy', () => {
  it('starts on its own planet with the other people', () => {
    const s = newBattleGame();
    expect(s.players.ai?.faction).toBe('alien');
    expect(s.players.ai?.homeBodyId).toBe(s.system.alienBodyId);
    expect(s.players.ai?.homeBodyId).not.toBe(s.players.player?.homeBodyId);
    expect(buildingsOf(s, 'ai', 'commandDome')).toHaveLength(1);
    expect(unitsOf(s, 'ai', 'drone')).toHaveLength(2);
  });

  it('builds up its base only with commands (economy grows)', () => {
    const s = newBattleGame(3);
    s.ai.ai!.nextAttackAt = Infinity;
    s.ai.ai!.free = true;
    play(s, 90 * MINUTE);
    const types = new Set(buildingsOf(s, 'ai').map((b) => b.building!.type));
    for (const t of ['solarField', 'regolithExcavator', 'lab', 'barracks', 'turret'] as const)
      expect(types.has(t)).toBe(true);
    expect(buildingsOf(s, 'ai').length).toBeGreaterThan(15);
    expect(unitsOf(s, 'ai', 'infantry').length).toBeGreaterThanOrEqual(3);
    expect(s.players.ai!.research.done).toContain('lasers');
  });

  it('finds free spots with a gap around each building', () => {
    const s = newBattleGame(3);
    const zone = s.players.ai!.homeBodyId;
    const spot = findBuildSpot(s, 'ai', zone, 'barracks');
    expect(spot).not.toBeNull();
    expect(findBuildSpot(s, 'ai', zone, 'pinkPump')).not.toBeNull();
  });

  it('stays near the level of a slow player and does not attack a weak one', () => {
    const s = newBattleGame(3);
    play(s, 4 * HOUR);
    const t = AI_TUNING.normal;
    const limit = t.lead * progressOf(s, 'player') + t.leadBonus;
    // Plus a few urgent things (energy, housing, storage), but far below a free computer.
    expect(progressOf(s, 'ai')).toBeLessThan(limit + 8);
    expect(s.ai.ai!.waves).toBe(0);
    expect(s.winner).toBeUndefined();
  });

  it('attacks a player at a similar level with a transport ship', () => {
    const s = playerBot(newBattleGame(3));
    play(s, 3 * HOUR);
    expect(s.ai.ai!.waves).toBeGreaterThanOrEqual(1);
    expect(s.events.some((e) => e.text.includes('feindliches Schiff'))).toBe(true);
    expect(s.events.some((e) => e.text.includes('gelandet'))).toBe(true);
  });

  it('also grows while the game is closed, but does not attack then', () => {
    const s = playerBot(newBattleGame(3));
    catchUp(s, 4 * HOUR);
    expect(buildingsOf(s, 'ai').length).toBeGreaterThan(15);
    expect(s.ai.ai!.waves).toBe(0);
    expect(s.winner).toBeUndefined();
  });

  it('with offline attacks on, the fight is calculated while the game is closed', () => {
    const s = playerBot(newBattleGame(3));
    s.settings.offlineAttacks = true;
    const report = catchUp(s, 4 * HOUR);
    expect(s.ai.ai!.waves).toBeGreaterThanOrEqual(1);
    expect(report.battle).toBeDefined();
    expect(report.battle!.lostBuildings + report.battle!.defeated).toBeGreaterThan(0);
  });

  it('easy waits longer before the first attack than hard', () => {
    const easy = createGame({ seed: 4, faction: 'human', time: 0, difficulty: 'easy' });
    const hard = createGame({ seed: 4, faction: 'human', time: 0, difficulty: 'hard' });
    expect(easy.ai.ai!.nextAttackAt).toBeGreaterThan(hard.ai.ai!.nextAttackAt);
  });

  it('plays the humans when the player picks the aliens', () => {
    const s = createGame({ seed: 4, faction: 'alien', time: 0 });
    expect(s.players.ai?.faction).toBe('human');
    expect(s.events[0]?.text).toContain('Brutkern');
  });
});
