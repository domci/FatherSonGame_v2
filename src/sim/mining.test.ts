import { describe, expect, it } from 'vitest';
import { applyCommand } from './commands';
import { HOUR, MINUTE } from './clock';
import { BELT_ID } from './generation/solar-system';
import { spawnUnit } from './spawn';
import { homeZone, newTestGame } from './test-helpers';
import { catchUp, economyStep } from './update';
import { cargoFor } from './systems/mining';
import type { GameState } from './state';

function addShip(s: GameState) {
  const ship = spawnUnit(s, 'player', homeZone(s), 'miningShip', { x: 20, y: 20 });
  s.world.addComponent(ship, 'ship', {
    phase: 'docked',
    phaseStartAt: 0,
    phaseEndsAt: 0,
    cargo: 0,
    capacity: 100,
    repeat: false,
  });
  return ship;
}

describe('mining ships', () => {
  it('fly to the belt, mine and bring metal home', () => {
    const s = newTestGame();
    const ship = addShip(s);
    expect(
      applyCommand(s, { type: 'sendShip', player: 'player', shipId: ship.id, targetId: BELT_ID })
        .ok,
    ).toBe(true);
    expect(ship.ship?.phase).toBe('outbound');
    economyStep(s, 30 * MINUTE);
    expect(s.players.player?.resources.metal ?? 0).toBeGreaterThan(0);
  });

  it('a gas planet gives gas', () => {
    const s = newTestGame();
    const gas = s.system.bodies.find((b) => b.kind === 'gas');
    if (!gas) return;
    expect(cargoFor(s, gas.id, 100)).toEqual({ gas: 100 });
  });

  it('keeps flying while the game is closed', () => {
    const s = newTestGame();
    const ship = addShip(s);
    applyCommand(s, { type: 'sendShip', player: 'player', shipId: ship.id, targetId: BELT_ID });
    const report = catchUp(s, 5 * HOUR);
    expect(report.gained.metal ?? 0).toBeGreaterThan(300);
  });

  it('returns to the port when recalled', () => {
    const s = newTestGame();
    const ship = addShip(s);
    applyCommand(s, { type: 'sendShip', player: 'player', shipId: ship.id, targetId: BELT_ID });
    applyCommand(s, { type: 'recallShip', player: 'player', shipId: ship.id });
    economyStep(s, 30 * MINUTE);
    expect(ship.ship?.phase).toBe('docked');
  });

  it('cannot fly to the home planet', () => {
    const s = newTestGame();
    const ship = addShip(s);
    const r = applyCommand(s, {
      type: 'sendShip',
      player: 'player',
      shipId: ship.id,
      targetId: s.system.homeBodyId,
    });
    expect(r.ok).toBe(false);
  });
});
