import { describe, expect, it } from 'vitest';
import { applyCommand } from './commands';
import { spawnBuilding, spawnUnit } from './spawn';
import { homeZone, newBattleGame, newTestGame } from './test-helpers';
import { tick } from './update';
import { armorOf, dealDamage, hitDamage } from './systems/damage';
import type { GameState } from './state';
import { buildingsOf, coreOf } from './ai/queries';

function runTicks(s: GameState, n: number): void {
  for (let i = 0; i < n; i++) tick(s);
}

function arena(): { s: GameState; zone: string; c: number } {
  const s = newTestGame();
  s.players.ai = { ...s.players.player!, id: 'ai', faction: 'alien', research: { done: [] } };
  for (const nest of s.world.with('nest').entities) s.world.remove(nest);
  return { s, zone: homeZone(s), c: s.surfaces[homeZone(s)]!.size / 2 };
}

describe('combat values', () => {
  it('armor lowers damage, but every hit does at least 1', () => {
    const { s, zone, c } = arena();
    const soldier = spawnUnit(s, 'player', zone, 'infantry', { x: c, y: c + 6 });
    const tank = spawnUnit(s, 'ai', zone, 'tank', { x: c + 2, y: c + 6 });
    expect(armorOf(s, tank)).toBe(4);
    expect(hitDamage(s, soldier, tank)).toBe(11 - 4);
    const wall = spawnBuilding(s, 'ai', zone, { type: 'wall', tileX: 2, tileY: 2, level: 3 });
    const weak = spawnUnit(s, 'player', zone, 'hunter', { x: 3, y: 4 });
    weak.attacker!.damage = 2;
    expect(hitDamage(s, weak, wall)).toBe(1);
  });

  it('tanks hit buildings harder', () => {
    const { s, zone, c } = arena();
    const tank = spawnUnit(s, 'player', zone, 'tank', { x: c, y: c + 6 });
    const barracks = spawnBuilding(s, 'ai', zone, {
      type: 'barracks',
      tileX: 4,
      tileY: 4,
      level: 1,
    });
    expect(hitDamage(s, tank, barracks)).toBe(Math.round(40 * 1.5 - 2));
  });

  it('research makes units stronger', () => {
    const { s, zone, c } = arena();
    const a = spawnUnit(s, 'player', zone, 'infantry', { x: c, y: c + 6 });
    const b = spawnUnit(s, 'ai', zone, 'infantry', { x: c + 1, y: c + 6 });
    s.players.player!.research.done.push('strongLasers');
    s.players.ai!.research.done.push('armor');
    expect(hitDamage(s, a, b)).toBe(Math.round(11 * 1.25 - 3));
  });
});

describe('fights', () => {
  it('idle soldiers fight enemies that come close, the loser disappears', () => {
    const { s, zone, c } = arena();
    const mine = [0, 1, 2].map((i) =>
      spawnUnit(s, 'player', zone, 'infantry', { x: c - 6 + i, y: c + 8 }),
    );
    const enemy = spawnUnit(s, 'ai', zone, 'infantry', { x: c - 2, y: c + 8 });
    runTicks(s, 200);
    expect(s.world.has(enemy)).toBe(false);
    expect(mine.some((u) => s.world.has(u))).toBe(true);
    expect(s.marks.length + 1).toBeGreaterThan(0);
  });

  it('turrets shoot enemies in range and leave the others alone', () => {
    const { s, zone } = arena();
    const turret = spawnBuilding(s, 'player', zone, {
      type: 'turret',
      tileX: 4,
      tileY: 4,
      level: 1,
    });
    expect(turret.attacker?.range).toBe(7);
    const near = spawnUnit(s, 'ai', zone, 'infantry', { x: 5, y: 10 });
    const far = spawnUnit(s, 'ai', zone, 'infantry', { x: 5, y: 30 });
    near.attacker!.damage = 0;
    runTicks(s, 300);
    expect(s.world.has(near)).toBe(false);
    expect(s.world.has(far)).toBe(true);
    expect(turret.attacker?.shot).toBeDefined();
  });

  it('the command dome defends itself with a small laser', () => {
    const { s, zone } = arena();
    const core = coreOf(s, 'player')!;
    expect(core.attacker?.damage).toBeGreaterThan(0);
    const p = core.position!;
    const raider = spawnUnit(s, 'ai', zone, 'infantry', { x: p.x + 4, y: p.y });
    raider.attacker!.damage = 0;
    runTicks(s, 400);
    expect(s.world.has(raider)).toBe(false);
  });

  it('a powered shield takes the damage first', () => {
    const { s, zone } = arena();
    s.players.player!.resources = {};
    const solar = spawnBuilding(s, 'player', zone, {
      type: 'solarField',
      tileX: 30,
      tileY: 30,
      level: 3,
    });
    expect(solar).toBeDefined();
    const reactor = spawnBuilding(s, 'player', zone, {
      type: 'shieldReactor',
      tileX: 6,
      tileY: 6,
      level: 1,
    });
    const barracks = spawnBuilding(s, 'player', zone, {
      type: 'barracks',
      tileX: 9,
      tileY: 6,
      level: 1,
    });
    dealDamage(s, barracks, 300);
    expect(barracks.health!.hp).toBe(700);
    expect(reactor.shield!.hp).toBe(900);
  });

  it('without enough energy the shield is off', () => {
    const { s, zone } = arena();
    spawnBuilding(s, 'player', zone, { type: 'shieldReactor', tileX: 6, tileY: 6, level: 1 });
    spawnBuilding(s, 'player', zone, { type: 'shieldReactor', tileX: 12, tileY: 6, level: 1 });
    const barracks = spawnBuilding(s, 'player', zone, {
      type: 'barracks',
      tileX: 9,
      tileY: 6,
      level: 1,
    });
    dealDamage(s, barracks, 300);
    expect(barracks.health!.hp).toBe(400);
  });

  it('force fields repair themselves', () => {
    const { s, zone } = arena();
    const field = spawnBuilding(s, 'player', zone, {
      type: 'forceField',
      tileX: 6,
      tileY: 6,
      level: 1,
    });
    field.health!.hp = 100;
    runTicks(s, 50);
    expect(field.health!.hp).toBeGreaterThan(150);
  });
});

describe('end of the game', () => {
  it('destroying the enemy core wins the game and stops commands', () => {
    const s = newBattleGame();
    const core = coreOf(s, 'ai')!;
    dealDamage(s, core, 1e6);
    expect(s.winner).toBe('player');
    expect(s.events.at(-1)?.text).toContain('zerstört');
    const dome = buildingsOf(s, 'player', 'commandDome')[0]!;
    expect(
      applyCommand(s, { type: 'train', player: 'player', buildingId: dome.id, unit: 'drone' }).ok,
    ).toBe(false);
  });

  it('losing the own core loses the game', () => {
    const s = newBattleGame();
    dealDamage(s, coreOf(s, 'player')!, 1e6);
    expect(s.winner).toBe('ai');
  });
});

describe('moving groups', () => {
  it('a group stands in a block, not on one point', () => {
    const { s, zone, c } = arena();
    const units = [0, 1, 2, 3].map((i) =>
      spawnUnit(s, 'player', zone, 'infantry', { x: c - 8 + i, y: c + 8 }),
    );
    applyCommand(s, {
      type: 'move',
      player: 'player',
      unitIds: units.map((u) => u.id),
      target: { x: c + 8, y: c + 8 },
    });
    runTicks(s, 150);
    const xs = new Set(units.map((u) => Math.round(u.position!.x * 10)));
    expect(xs.size).toBeGreaterThan(1);
    for (const u of units)
      expect(Math.hypot(u.position!.x - c - 8, u.position!.y - c - 8)).toBeLessThan(1.5);
  });

  it('a new move order replaces the old path', () => {
    const { s, zone, c } = arena();
    const u = spawnUnit(s, 'player', zone, 'infantry', { x: c - 8, y: c + 8 });
    applyCommand(s, {
      type: 'move',
      player: 'player',
      unitIds: [u.id],
      target: { x: c + 8, y: c + 8 },
    });
    runTicks(s, 5);
    applyCommand(s, {
      type: 'move',
      player: 'player',
      unitIds: [u.id],
      target: { x: c - 8, y: c + 12 },
    });
    runTicks(s, 100);
    expect(u.position!.y).toBeCloseTo(c + 12, 0);
  });
});
