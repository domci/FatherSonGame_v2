import { describe, expect, it } from 'vitest';
import { applyCommand } from './commands';
import { createGame } from './game';
import { blockers } from './space/places';
import { spawnUnit, spawnWarship } from './spawn';
import { nearestEnemy } from './systems/targeting';
import { allied, hostile, relationOf, setRelation } from './relations';
import { battleArena } from './test-helpers';
import { tick } from './update';
import { visibleTiles } from './visibility';
import type { GameState } from './state';

const MIN = 60_000;

function threeSides(): GameState {
  const s = createGame({ seed: 3, faction: 'human', time: 0, opponents: 2 });
  s.time = 6 * MIN;
  return s;
}

describe('relations', () => {
  it('starts at war; the spiders are always at war', () => {
    const s = threeSides();
    expect(relationOf(s, 'player', 'ai')).toBe('war');
    expect(relationOf(s, 'ai', 'ai')).toBe('self');
    expect(hostile(s, 'ai2', 'wild')).toBe(true);
    setRelation(s, 'ai', 'player', 'alliance');
    expect(relationOf(s, 'player', 'ai')).toBe('alliance');
    expect(allied(s, 'ai', 'player')).toBe(true);
    expect(hostile(s, 'player', 'ai')).toBe(false);
  });

  it('sides at peace do not shoot each other and may not be attacked', () => {
    const { s, zone, c } = battleArena();
    const tank = spawnUnit(s, 'player', zone, 'tank', { x: c, y: c + 6 });
    const soldier = spawnUnit(s, 'ai', zone, 'infantry', { x: c + 2, y: c + 6 });
    expect(nearestEnemy(s, tank, 10, [soldier])).toBe(soldier);
    setRelation(s, 'player', 'ai', 'peace');
    expect(nearestEnemy(s, tank, 10, [soldier])).toBeUndefined();
    const r = applyCommand(s, {
      type: 'attack',
      player: 'player',
      unitIds: [tank.id],
      targetId: soldier.id,
    });
    expect(r.ok).toBe(false);
  });

  it('ships of sides at peace do not block', () => {
    const s = threeSides();
    const home = s.system.homeBodyId;
    spawnWarship(s, 'ai', home, 'spaceFighter');
    expect(blockers(s, 'player', home)).toHaveLength(1);
    setRelation(s, 'player', 'ai', 'peace');
    expect(blockers(s, 'player', home)).toHaveLength(0);
  });

  it('allies share what they see', () => {
    const { s, zone, c } = battleArena();
    spawnUnit(s, 'ai', zone, 'infantry', { x: c + 20, y: c + 20 });
    const size = s.surfaces[zone]?.size ?? 0;
    const at = Math.floor(c + 20) * size + Math.floor(c + 20);
    expect(visibleTiles(s, 'player', zone)[at]).toBe(0);
    setRelation(s, 'player', 'ai', 'alliance');
    expect(visibleTiles(s, 'player', zone)[at]).toBe(1);
  });
});

describe('diplomacy commands', () => {
  it('peace needs some time after the start of a war', () => {
    const s = threeSides();
    s.time = 2 * MIN;
    const r = applyCommand(s, { type: 'diplomacy', player: 'player', side: 'ai', action: 'peace' });
    expect(r).toEqual({ ok: false, reason: 'Frieden ist erst in 3 Minuten möglich.' });
  });

  it('the computer takes peace when both face a common danger', () => {
    const s = threeSides();
    const r = applyCommand(s, { type: 'diplomacy', player: 'player', side: 'ai', action: 'peace' });
    expect(r.ok).toBe(true);
    expect(relationOf(s, 'player', 'ai')).toBe('peace');
    expect(s.events.at(-1)?.text).toContain('Frieden mit');
  });

  it('the computer says no to peace when it feels strong (hard level)', () => {
    const s = createGame({ seed: 3, faction: 'human', time: 0, difficulty: 'hard' });
    s.time = 6 * MIN;
    for (let i = 0; i < 4; i++)
      spawnUnit(s, 'ai', s.players.ai?.homeBodyId ?? '', 'tank', { x: 30, y: 30 + i });
    const r = applyCommand(s, { type: 'diplomacy', player: 'player', side: 'ai', action: 'peace' });
    expect(r.ok).toBe(false);
    expect(relationOf(s, 'player', 'ai')).toBe('war');
  });

  it('an alliance needs peace first, some time, and a common enemy', () => {
    const s = threeSides();
    const ask = (): boolean =>
      applyCommand(s, { type: 'diplomacy', player: 'player', side: 'ai', action: 'alliance' }).ok;
    expect(ask()).toBe(false);
    setRelation(s, 'player', 'ai', 'peace');
    expect(ask()).toBe(false);
    s.time += 5 * MIN;
    expect(ask()).toBe(true);
    expect(relationOf(s, 'player', 'ai')).toBe('alliance');
    const war = applyCommand(s, { type: 'diplomacy', player: 'player', side: 'ai', action: 'war' });
    expect(war.ok).toBe(false);
  });

  it('a broken alliance is not forgotten', () => {
    const s = threeSides();
    setRelation(s, 'player', 'ai', 'alliance');
    const end = { type: 'diplomacy', player: 'player', side: 'ai', action: 'endAlliance' } as const;
    expect(applyCommand(s, end).ok).toBe(true);
    expect(relationOf(s, 'player', 'ai')).toBe('peace');
    expect(s.ai.ai?.distrust).toEqual(['player']);
    s.time += 10 * MIN;
    const r = applyCommand(s, { ...end, action: 'alliance' });
    expect(r).toEqual({ ok: false, reason: 'Schwarm Xar traut euch nicht mehr.' });
  });

  it('offers of the computer wait for the player, who can say yes or no', () => {
    const s = threeSides();
    expect(
      applyCommand(s, { type: 'diplomacy', player: 'ai', side: 'player', action: 'peace' }).ok,
    ).toBe(true);
    expect(s.offers).toHaveLength(1);
    expect(relationOf(s, 'player', 'ai')).toBe('war');
    applyCommand(s, { type: 'diplomacy', player: 'player', side: 'ai', action: 'peace' });
    expect(relationOf(s, 'player', 'ai')).toBe('peace');
    expect(s.offers).toHaveLength(0);
    applyCommand(s, { type: 'diplomacy', player: 'ai2', side: 'player', action: 'peace' });
    expect(
      applyCommand(s, { type: 'diplomacy', player: 'player', side: 'ai2', action: 'decline' }).ok,
    ).toBe(true);
    expect(s.offers).toHaveLength(0);
  });

  it('offers end after some minutes', () => {
    const s = threeSides();
    applyCommand(s, { type: 'diplomacy', player: 'ai', side: 'player', action: 'peace' });
    s.time += 3 * MIN;
    tick(s);
    expect(s.offers).toHaveLength(0);
  });
});
