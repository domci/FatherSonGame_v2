import { describe, expect, it } from 'vitest';
import { applyCommand } from '../sim/commands';
import { createOnlineWorld } from '../sim/online';
import { fromSaveData, toSaveData } from '../sim/save/save';
import type { GameState } from '../sim/state';
import { tick } from '../sim/update';
import { digest } from './digest';

function busyWorld(): GameState {
  const s = createOnlineWorld({
    seed: 11,
    time: 1_000_000,
    faction: 'human',
    name: 'Roter Falke 1',
    difficulty: 'normal',
    computers: 2,
    people: 2,
  });
  applyCommand(s, { type: 'join', player: 'ai3', faction: 'alien', name: 'Blauer Komet 2' });
  // Computer brains play both people, so that a lot happens.
  for (const id of ['player', 'ai3'] as const) s.ai[id] = { nextThinkAt: 0, nextAttackAt: 0, waves: 0 };
  return s;
}

/** Save and load: what a browser gets when it joins (the server does the same). */
function reload(s: GameState): GameState {
  return fromSaveData(toSaveData(s, 0));
}

describe('lockstep fingerprint (M7)', () => {
  it('is the same for the same state and changes when the game goes on', () => {
    const s = busyWorld();
    expect(digest(s)).toBe(digest(reload(s)));
    const before = digest(s);
    tick(s);
    expect(digest(s)).not.toBe(before);
  });

  it('a loaded snapshot runs exactly like the server copy for a long time', () => {
    const s = busyWorld();
    for (let i = 0; i < 3000; i++) tick(s);
    const server = reload(s);
    const browser = reload(s);
    for (let i = 0; i < 9000; i++) {
      tick(server);
      tick(browser);
      if (i % 500 === 0) expect(digest(browser)).toBe(digest(server));
    }
    expect(digest(browser)).toBe(digest(server));
    expect(server.world.entities.length).toBeGreaterThan(20);
  });
});
