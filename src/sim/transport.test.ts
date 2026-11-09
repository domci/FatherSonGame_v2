import { describe, expect, it } from 'vitest';
import { applyCommand } from './commands';
import { HOUR, MINUTE } from './clock';
import type { Entity } from './entity';
import { spawnBuilding, spawnUnit } from './spawn';
import { newBattleGame } from './test-helpers';
import { economyStep } from './update';
import type { GameState } from './state';
import { catchUp } from './catch-up';
import { dealDamage } from './systems/damage';

function setup(): { s: GameState; ship: Entity; soldiers: Entity[]; home: string; enemy: string } {
  const s = newBattleGame();
  const home = s.players.player!.homeBodyId;
  const enemy = s.players.ai!.homeBodyId;
  const port = spawnBuilding(s, 'player', home, {
    type: 'spaceport',
    tileX: 10,
    tileY: 10,
    level: 1,
  });
  s.players.player!.resources = {
    regolith: 5000,
    diamonds: 500,
    water: 500,
    food: 500,
    oxygen: 500,
  };
  applyCommand(s, { type: 'train', player: 'player', buildingId: port.id, unit: 'transport' });
  economyStep(s, 61_000);
  const ship = s.world.with('ship').entities.find((e) => e.unit?.type === 'transport')!;
  const soldiers = [0, 1, 2].map((i) =>
    spawnUnit(s, 'player', home, 'infantry', { x: 20 + i, y: 30 }),
  );
  return { s, ship, soldiers, home, enemy };
}

describe('transport ships', () => {
  it('the spaceport builds a transport ship', () => {
    const { ship } = setup();
    expect(ship.ship?.phase).toBe('docked');
  });

  it('units board, fly to the enemy planet and land there', () => {
    const { s, ship, soldiers, enemy } = setup();
    const ids = soldiers.map((u) => u.id);
    expect(
      applyCommand(s, { type: 'board', player: 'player', shipId: ship.id, unitIds: ids }).ok,
    ).toBe(true);
    expect(soldiers.every((u) => u.aboard && u.zone === 'space')).toBe(true);
    expect(
      applyCommand(s, { type: 'fly', player: 'player', shipId: ship.id, targetId: enemy }).ok,
    ).toBe(true);
    expect(ship.ship?.phase).toBe('outbound');
    economyStep(s, 5 * MINUTE);
    expect(ship.ship?.phase).toBe('landed');
    expect(ship.zone).toBe(enemy);
    expect(soldiers.every((u) => !u.aboard && u.zone === enemy)).toBe(true);
  });

  it('respects the space in the ship', () => {
    const { s, ship, home } = setup();
    const tanks = [0, 1, 2, 3].map((i) =>
      spawnUnit(s, 'player', home, 'tank', { x: 20 + i, y: 34 }),
    );
    applyCommand(s, {
      type: 'board',
      player: 'player',
      shipId: ship.id,
      unitIds: tanks.map((t) => t.id),
    });
    expect(tanks.filter((t) => t.aboard)).toHaveLength(3);
  });

  it('cannot fly while flying, and passengers die with the ship', () => {
    const { s, ship, soldiers, enemy, home } = setup();
    applyCommand(s, {
      type: 'board',
      player: 'player',
      shipId: ship.id,
      unitIds: [soldiers[0]!.id],
    });
    applyCommand(s, { type: 'fly', player: 'player', shipId: ship.id, targetId: enemy });
    expect(
      applyCommand(s, { type: 'fly', player: 'player', shipId: ship.id, targetId: home }).ok,
    ).toBe(false);
    economyStep(s, 5 * MINUTE);
    applyCommand(s, {
      type: 'board',
      player: 'player',
      shipId: ship.id,
      unitIds: [soldiers[0]!.id],
    });
    expect(soldiers[0]!.aboard).toBeDefined();
    dealDamage(s, ship, 1e6);
    expect(s.world.has(soldiers[0]!)).toBe(false);
  });

  it('enemy ships wait in orbit while the player is away (offline attacks off)', () => {
    const s = newBattleGame();
    const home = s.players.player!.homeBodyId;
    const enemy = s.players.ai!.homeBodyId;
    const port = spawnBuilding(s, 'ai', enemy, { type: 'spaceport', tileX: 6, tileY: 6, level: 1 });
    s.players.ai!.resources = { regolith: 5000, diamonds: 500, water: 500 };
    applyCommand(s, { type: 'train', player: 'ai', buildingId: port.id, unit: 'transport' });
    economyStep(s, 61_000);
    const ship = s.world.with('ship').entities.find((e) => e.owner === 'ai')!;
    applyCommand(s, { type: 'fly', player: 'ai', shipId: ship.id, targetId: home });
    s.ai = {};
    catchUp(s, 2 * HOUR);
    expect(ship.ship?.phase).toBe('outbound');
    economyStep(s, 1000);
    expect(ship.zone).toBe(home);
  });
});
