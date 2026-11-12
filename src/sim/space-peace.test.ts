import { describe, expect, it } from 'vitest';
import { setRelation } from './relations';
import { spawnWarship } from './spawn';
import { STRIKE_MS } from './systems/orbit-strike';
import { battleArena } from './test-helpers';
import { tick } from './update';
import type { GameState } from './state';

function runTicks(s: GameState, n: number): void {
  for (let i = 0; i < n; i++) tick(s);
}

function otherPlanet(s: GameState): string {
  const id = s.system.bodies.find((b) => b.id !== s.system.homeBodyId)?.id;
  if (!id) throw new Error('no planet');
  return id;
}

describe('space with peace and alliances (M6)', () => {
  it('fleets of sides at peace do not fight', () => {
    const { s } = battleArena();
    setRelation(s, 'player', 'ai', 'peace');
    const place = otherPlanet(s);
    const mine = spawnWarship(s, 'player', place, 'cruiser');
    const theirs = spawnWarship(s, 'ai', place, 'spaceFighter');
    runTicks(s, 200);
    expect(s.world.has(mine) && s.world.has(theirs)).toBe(true);
  });

  it('cruisers with the Orbitallaser do not shoot at allies', () => {
    const { s, zone } = battleArena();
    setRelation(s, 'player', 'ai', 'alliance');
    s.players.ai?.research.done.push('orbitalLaser');
    spawnWarship(s, 'ai', zone, 'cruiser');
    runTicks(s, STRIKE_MS / 100 + 1);
    expect(s.marks.some((m) => m.kind === 'strike')).toBe(false);
  });
});
