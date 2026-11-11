import { describe, expect, it } from 'vitest';
import { applyCommand, type Command } from './commands';
import { canHit, layerOf } from './layers';
import { spawnBuilding, spawnUnit } from './spawn';
import { nearestEnemy } from './systems/targeting';
import { battleArena } from './test-helpers';
import { tick } from './update';
import type { GameState } from './state';

function runTicks(s: GameState, n: number): void {
  for (let i = 0; i < n; i++) tick(s);
}

describe('ground and air', () => {
  it('each weapon hits only its layers', () => {
    const { s, zone, c } = battleArena();
    const tank = spawnUnit(s, 'player', zone, 'tank', { x: c, y: c + 6 });
    const flak = spawnUnit(s, 'player', zone, 'flakTank', { x: c, y: c + 7 });
    const fighter = spawnUnit(s, 'ai', zone, 'fighter', { x: c + 2, y: c + 6 });
    const soldier = spawnUnit(s, 'ai', zone, 'infantry', { x: c + 2, y: c + 7 });
    expect(layerOf(fighter)).toBe('air');
    expect(canHit(tank, fighter)).toBe(false);
    expect(canHit(tank, soldier)).toBe(true);
    expect(canHit(flak, fighter)).toBe(true);
    expect(canHit(flak, soldier)).toBe(false);
    expect(canHit(fighter, tank)).toBe(true);
    expect(nearestEnemy(tank, 10, [fighter, soldier])).toBe(soldier);
    expect(nearestEnemy(flak, 10, [soldier, fighter])).toBe(fighter);
    const r = applyCommand(s, {
      type: 'attack',
      player: 'player',
      unitIds: [tank.id],
      targetId: fighter.id,
    });
    expect(r).toEqual({ ok: false, reason: 'Diese Einheiten können das nicht treffen.' });
  });

  it('the command dome shoots at planes, the flak tower only at planes', () => {
    const { s, zone } = battleArena();
    const dome = s.world.with('building').entities.find((b) => b.building.type === 'commandDome');
    const tower = spawnBuilding(s, 'player', zone, {
      type: 'flakTower',
      tileX: 2,
      tileY: 2,
      level: 1,
    });
    const fighter = spawnUnit(s, 'ai', zone, 'fighter', { x: 3, y: 6 });
    const soldier = spawnUnit(s, 'ai', zone, 'infantry', { x: 4, y: 3 });
    expect(dome && canHit(dome, fighter)).toBe(true);
    expect(canHit(tower, fighter)).toBe(true);
    expect(canHit(tower, soldier)).toBe(false);
  });

  it('bombers go for buildings first', () => {
    const { s, zone, c } = battleArena();
    const bomber = spawnUnit(s, 'ai', zone, 'bomber', { x: c, y: c + 10 });
    const drone = spawnUnit(s, 'player', zone, 'drone', { x: c + 1, y: c + 10 });
    const lab = spawnBuilding(s, 'player', zone, {
      type: 'lab',
      tileX: c + 2,
      tileY: c + 9,
      level: 1,
    });
    expect(nearestEnemy(bomber, 8, [drone, lab])).toBe(lab);
  });

  it('planes fly straight over walls', () => {
    const { s, zone, c } = battleArena();
    s.players.player!.resources.gas = 100;
    for (let y = 0; y < 2 * c; y++)
      spawnBuilding(s, 'player', zone, { type: 'wall', tileX: c + 3, tileY: y, level: 1 });
    const fighter = spawnUnit(s, 'player', zone, 'fighter', { x: c, y: c + 5 });
    const target = { x: c + 8, y: c + 5 };
    applyCommand(s, { type: 'move', player: 'player', unitIds: [fighter.id], target });
    expect(fighter.mover?.path).toEqual([target]);
    runTicks(s, 20);
    expect(fighter.position!.x).toBeCloseTo(c + 8, 1);
  });
});

describe('fuel (gas)', () => {
  it('flying planes use gas, standing planes do not', () => {
    const { s, zone, c } = battleArena();
    const player = s.players.player!;
    player.resources.gas = 10;
    const fighter = spawnUnit(s, 'player', zone, 'fighter', { x: c, y: c + 5 });
    runTicks(s, 50);
    expect(player.resources.gas).toBe(10);
    applyCommand(s, {
      type: 'move',
      player: 'player',
      unitIds: [fighter.id],
      target: { x: 2, y: 2 },
    });
    runTicks(s, 50);
    expect(player.resources.gas).toBeCloseTo(10 - 3 * (5 / 60), 3);
  });

  it('without gas planes do not start; when it runs out they stop', () => {
    const { s, zone, c } = battleArena();
    const player = s.players.player!;
    player.resources.gas = 0;
    const fighter = spawnUnit(s, 'player', zone, 'fighter', { x: c, y: c + 5 });
    const order: Command = {
      type: 'move',
      player: 'player',
      unitIds: [fighter.id],
      target: { x: 2, y: 2 },
    };
    expect(applyCommand(s, order).ok).toBe(false);
    player.resources.gas = 1.02;
    expect(applyCommand(s, order).ok).toBe(true);
    runTicks(s, 10);
    expect(fighter.mover).toBeUndefined();
    expect(player.resources.gas).toBe(0);
    expect(s.events.at(-1)?.text).toContain('Kein Gas');
  });
});

describe('air field and flak', () => {
  it('planes need the research Luftfahrt', () => {
    const { s, zone } = battleArena();
    const player = s.players.player!;
    Object.assign(player.resources, { regolith: 5000, metal: 500, gas: 500, diamonds: 100 });
    spawnBuilding(s, 'player', zone, { type: 'habitatDome', tileX: 2, tileY: 8, level: 3 });
    const field = spawnBuilding(s, 'player', zone, {
      type: 'airfield',
      tileX: 2,
      tileY: 2,
      level: 1,
    });
    const train = {
      type: 'train',
      player: 'player',
      buildingId: field.id,
      unit: 'fighter',
    } as const;
    expect(applyCommand(s, train)).toEqual({ ok: false, reason: 'Braucht zuerst: Luftfahrt.' });
    player.research.done.push('aviation');
    expect(applyCommand(s, train).ok).toBe(true);
  });

  it('transport ships take planes along, but no drones', () => {
    const { s, zone, c } = battleArena();
    const ship = spawnUnit(s, 'player', zone, 'transport', { x: c, y: c + 6 });
    s.world.addComponent(ship, 'ship', {
      phase: 'docked',
      phaseStartAt: 0,
      phaseEndsAt: 0,
      cargo: 0,
      capacity: 0,
      repeat: false,
    });
    const bomber = spawnUnit(s, 'player', zone, 'bomber', { x: c + 1, y: c + 6 });
    const drone = spawnUnit(s, 'player', zone, 'drone', { x: c + 2, y: c + 6 });
    applyCommand(s, {
      type: 'board',
      player: 'player',
      shipId: ship.id,
      unitIds: [bomber.id, drone.id],
    });
    expect(bomber.aboard?.shipId).toBe(ship.id);
    expect(drone.aboard).toBeUndefined();
  });

  it('a flak tower shoots planes down', () => {
    const { s, zone } = battleArena();
    spawnBuilding(s, 'player', zone, { type: 'flakTower', tileX: 4, tileY: 4, level: 1 });
    const fighter = spawnUnit(s, 'ai', zone, 'fighter', { x: 5, y: 9 });
    runTicks(s, 120);
    expect(s.world.has(fighter)).toBe(false);
  });
});
