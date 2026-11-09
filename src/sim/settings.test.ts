import { describe, expect, it } from 'vitest';
import { applyCommand } from './commands';
import { newBattleGame } from './test-helpers';

describe('game settings', () => {
  it('the player can switch offline attacks and difficulty', () => {
    const s = newBattleGame();
    expect(s.settings.offlineAttacks).toBe(false);
    const r = applyCommand(s, {
      type: 'settings',
      player: 'player',
      offlineAttacks: true,
      difficulty: 'hard',
    });
    expect(r.ok).toBe(true);
    expect(s.settings.offlineAttacks).toBe(true);
    expect(s.settings.difficulty).toBe('hard');
  });

  it('the computer cannot change the settings', () => {
    const s = newBattleGame();
    expect(applyCommand(s, { type: 'settings', player: 'ai', offlineAttacks: true }).ok).toBe(
      false,
    );
    expect(s.settings.offlineAttacks).toBe(false);
  });
});
