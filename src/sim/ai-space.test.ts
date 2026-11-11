import { describe, expect, it } from 'vitest';
import { runMilitary } from './ai/military';
import { sendMiners } from './ai/miners';
import { moveFleet } from './ai/fleet';
import { unitsOf } from './ai/queries';
import { BELT_ID, findBody } from './generation/solar-system';
import { spawnBuilding, spawnUnit, spawnWarship } from './spawn';
import { launchShip } from './systems/mining';
import { newBattleGame } from './test-helpers';
import type { Entity } from './entity';
import type { GameState } from './state';

const LIVE = { offline: false };

function rich(s: GameState): void {
  Object.assign(s.players.ai!.resources, {
    regolith: 9000,
    metal: 2000,
    diamonds: 500,
    gas: 900,
    food: 900,
    oxygen: 900,
  });
}

function aiBuilding(s: GameState, type: 'spaceport' | 'airfield' | 'vehicleFactory', x: number) {
  const zone = s.players.ai!.homeBodyId;
  return spawnBuilding(s, 'ai', zone, { type, tileX: x, tileY: 4, level: 1 });
}

function miner(s: GameState, owner: 'player' | 'ai'): Entity {
  const zone = s.players[owner]!.homeBodyId;
  const ship = spawnUnit(s, owner, zone, 'miningShip', { x: 10, y: 10 });
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

describe('computer in the air and in space', () => {
  it('sends one mining ship to a gas planet, the others to the belt', () => {
    const s = newBattleGame(3);
    const ships = [miner(s, 'ai'), miner(s, 'ai'), miner(s, 'ai')];
    sendMiners(s, 'ai');
    const kinds = ships.map((m) => {
      const t = m.ship?.targetBodyId ?? '';
      return t === BELT_ID ? 'belt' : findBody(s.system, t)?.kind;
    });
    expect(kinds.filter((k) => k === 'gas')).toHaveLength(1);
    expect(kinds.filter((k) => k === 'belt')).toHaveLength(2);
  });

  it('trains flak when the enemy has planes', () => {
    const s = newBattleGame(3);
    s.ai.ai!.free = true;
    rich(s);
    s.players.ai!.research.done.push('flak', 'lasers');
    aiBuilding(s, 'vehicleFactory', 4);
    spawnBuilding(s, 'ai', s.players.ai!.homeBodyId, {
      type: 'habitatDome',
      tileX: 12,
      tileY: 12,
      level: 3,
    });
    const home = s.players.player!.homeBodyId;
    for (let i = 0; i < 2; i++) spawnUnit(s, 'player', home, 'fighter', { x: 20 + i, y: 20 });
    runMilitary(s, s.players.ai!, s.ai.ai!, LIVE);
    const training = s.world.with('training').entities.find((b) => b.owner === 'ai');
    expect(training?.training.unit).toBe('flakTank');
  });

  it('builds war ships with the research', () => {
    const s = newBattleGame(3);
    s.ai.ai!.free = true;
    rich(s);
    s.players.ai!.research.done.push('warships');
    aiBuilding(s, 'spaceport', 4);
    runMilitary(s, s.players.ai!, s.ai.ai!, LIVE);
    const training = s.world.with('training').entities.find((b) => b.owner === 'ai');
    expect(training?.training.unit).toBe('cruiser');
  });

  it('blocks the enemy mining, and attacks from orbit with the Orbitallaser', () => {
    const s = newBattleGame(3);
    const ai = s.ai.ai!;
    ai.free = true;
    ai.nextAttackAt = 0;
    const home = s.players.ai!.homeBodyId;
    const ships = [0, 1].map(() => spawnWarship(s, 'ai', home, 'cruiser'));
    launchShip(s, miner(s, 'player'), BELT_ID);
    moveFleet(s, s.players.ai!, ai, LIVE);
    expect(ships.every((e) => e.orbit?.to === BELT_ID)).toBe(true);
    for (const e of ships) {
      e.orbit!.at = home;
      delete e.orbit!.to;
    }
    s.players.ai!.research.done.push('orbitalLaser');
    moveFleet(s, s.players.ai!, ai, LIVE);
    expect(ships.every((e) => e.orbit?.to === s.players.player!.homeBodyId)).toBe(true);
  });

  it('keeps its fleet home against a level-matched player that is still weak', () => {
    const s = newBattleGame(3);
    const home = s.players.ai!.homeBodyId;
    const ships = [0, 1].map(() => spawnWarship(s, 'ai', home, 'cruiser'));
    s.ai.ai!.nextAttackAt = 0;
    launchShip(s, miner(s, 'player'), BELT_ID);
    moveFleet(s, s.players.ai!, s.ai.ai!, LIVE);
    expect(ships.every((e) => !e.orbit?.to)).toBe(true);
    expect(unitsOf(s, 'ai', 'cruiser')).toHaveLength(2);
  });
});
