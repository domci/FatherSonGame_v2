import { describe, expect, it } from 'vitest';
import { MISSION } from '../content/mission';
import { applyCommand } from './commands';
import { spawnBuilding } from './spawn';
import { goalReached, missionSystem, rewardText } from './systems/mission';
import { freeSpot, homeZone, newTestGame } from './test-helpers';
import type { GameState } from './state';

function me(s: GameState) {
  const p = s.players.player;
  if (!p) throw new Error('no player');
  return p;
}

describe('first mission', () => {
  it('starts at step 1 and pays a reward for each step', () => {
    const s = newTestGame();
    expect(me(s).mission).toEqual({ step: 0, off: false });
    missionSystem(s);
    expect(me(s).mission.step).toBe(0);
    const before = me(s).resources.regolith ?? 0;
    spawnBuilding(s, 'player', homeZone(s), {
      type: 'solarField',
      ...freeSpot(s, 'solarField'),
      level: 1,
    });
    missionSystem(s);
    expect(me(s).mission.step).toBe(1);
    expect(me(s).resources.regolith).toBe(before + (MISSION[0]?.reward.regolith ?? 0));
    expect(s.events.some((e) => e.text.includes('Aufgabe geschafft'))).toBe(true);
  });

  it('a site that is still being built does not count', () => {
    const s = newTestGame();
    spawnBuilding(s, 'player', homeZone(s), {
      type: 'solarField',
      ...freeSpot(s, 'solarField'),
      level: 0,
    });
    expect(goalReached(s, me(s), { kind: 'build', building: 'solarField' })).toBe(false);
  });

  it('knows people, research and quiz goals', () => {
    const s = newTestGame();
    const p = me(s);
    expect(goalReached(s, p, { kind: 'people', count: 12 })).toBe(false);
    p.colony.people = 12;
    expect(goalReached(s, p, { kind: 'people', count: 12 })).toBe(true);
    expect(goalReached(s, p, { kind: 'research' })).toBe(false);
    p.research.done.push('lasers');
    expect(goalReached(s, p, { kind: 'research' })).toBe(true);
    expect(goalReached(s, p, { kind: 'quiz' })).toBe(false);
    p.quiz.right = 1;
    expect(goalReached(s, p, { kind: 'quiz' })).toBe(true);
  });

  it('ends with a message after the last step', () => {
    const s = newTestGame();
    me(s).mission.step = MISSION.length - 1;
    spawnBuilding(s, 'player', homeZone(s), {
      type: 'barracks',
      ...freeSpot(s, 'barracks'),
      level: 1,
    });
    missionSystem(s);
    missionSystem(s);
    expect(me(s).mission.step).toBe(MISSION.length);
    expect(s.events.filter((e) => e.text.includes('Mission')).length).toBe(1);
  });

  it('can be switched off', () => {
    const s = newTestGame();
    expect(applyCommand(s, { type: 'missionOff', player: 'player' }).ok).toBe(true);
    me(s).quiz.right = 1;
    spawnBuilding(s, 'player', homeZone(s), {
      type: 'solarField',
      ...freeSpot(s, 'solarField'),
      level: 1,
    });
    missionSystem(s);
    expect(me(s).mission.step).toBe(0);
  });

  it('writes rewards for people', () => {
    expect(rewardText({ water: 50, oxygen: 50 })).toBe('50 Wasser, 50 Sauerstoff');
  });
});
