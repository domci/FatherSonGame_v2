import { describe, expect, it } from 'vitest';
import { UNITS } from '../content/units';
import { applyCommand } from './commands';
import { BELT_ID } from './generation/solar-system';
import { spawnBuilding, spawnUnit, spawnWarship } from './spawn';
import { spaceTravelMs } from './space/places';
import { launchShip } from './systems/mining';
import { STRIKE_MS } from './systems/orbit-strike';
import { battleArena } from './test-helpers';
import { economyStep, tick } from './update';
import type { Entity } from './entity';
import type { GameState } from './state';

function runTicks(s: GameState, n: number): void {
  for (let i = 0; i < n; i++) tick(s);
}

function otherPlanet(s: GameState): string {
  const id = s.system.bodies.find((b) => b.id !== s.system.homeBodyId)?.id;
  if (!id) throw new Error('no planet');
  return id;
}

function miningShip(s: GameState, zone: string, c: number): Entity {
  const ship = spawnUnit(s, 'player', zone, 'miningShip', { x: c, y: c + 6 });
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

describe('war ships', () => {
  it('a new war ship waits in orbit above the spaceport', () => {
    const { s, zone } = battleArena();
    const player = s.players.player!;
    player.research.done.push('warships');
    Object.assign(player.resources, { regolith: 5000, metal: 500, gas: 500, diamonds: 100 });
    const port = spawnBuilding(s, 'player', zone, {
      type: 'spaceport',
      tileX: 2,
      tileY: 2,
      level: 1,
    });
    const r = applyCommand(s, {
      type: 'train',
      player: 'player',
      buildingId: port.id,
      unit: 'cruiser',
    });
    expect(r.ok).toBe(true);
    economyStep(s, UNITS.cruiser.trainSeconds * 1000);
    const cruiser = s.world.with('orbit').entities[0];
    expect(cruiser?.orbit?.at).toBe(zone);
    expect(cruiser?.position).toBeUndefined();
  });

  it('a fleet flies together at the speed of its slowest ship', () => {
    const { s, zone } = battleArena();
    const target = otherPlanet(s);
    const a = spawnWarship(s, 'player', zone, 'spaceFighter');
    const b = spawnWarship(s, 'player', zone, 'cruiser');
    const fast = spaceTravelMs(s, zone, target, UNITS.spaceFighter.speed);
    const slow = spaceTravelMs(s, zone, target, UNITS.cruiser.speed);
    expect(slow).toBeGreaterThan(fast);
    expect(applyCommand(s, { type: 'fleet', player: 'player', targetId: target }).ok).toBe(true);
    expect(applyCommand(s, { type: 'fleet', player: 'player', targetId: target }).ok).toBe(false);
    economyStep(s, fast);
    expect(a.orbit?.to).toBe(target);
    expect(b.orbit?.to).toBe(target);
    economyStep(s, slow - fast);
    expect(a.orbit).toMatchObject({ at: target });
    expect(a.orbit?.to).toBeUndefined();
    expect(b.orbit?.at).toBe(target);
    expect(s.events.at(-1)?.text).toContain('angekommen');
  });

  it('fleets at the same place fight; the stronger one wins', () => {
    const { s } = battleArena();
    const place = otherPlanet(s);
    const mine = [0, 1].map(() => spawnWarship(s, 'player', place, 'cruiser'));
    const theirs = spawnWarship(s, 'ai', place, 'spaceFighter');
    runTicks(s, 200);
    expect(s.world.has(theirs)).toBe(false);
    expect(mine.every((m) => s.world.has(m))).toBe(true);
    expect(s.events.some((e) => e.text.includes('zerstört'))).toBe(true);
  });

  it('an orbital cannon shoots enemy ships above its planet', () => {
    const { s, zone } = battleArena();
    spawnBuilding(s, 'player', zone, { type: 'orbitalCannon', tileX: 2, tileY: 2, level: 1 });
    const raider = spawnWarship(s, 'ai', zone, 'spaceFighter');
    runTicks(s, 120);
    expect(s.world.has(raider)).toBe(false);
  });
});

describe('blockade', () => {
  it('a mining ship meets enemy ships at the belt: it is shot at and flies home empty', () => {
    const { s, zone, c } = battleArena();
    spawnWarship(s, 'ai', BELT_ID, 'spaceFighter');
    const ship = miningShip(s, zone, c);
    launchShip(s, ship, BELT_ID);
    economyStep(s, ship.ship!.phaseEndsAt - s.time);
    expect(ship.ship?.phase).toBe('returning');
    expect(ship.ship?.repeat).toBe(false);
    expect(ship.health!.hp).toBeLessThan(ship.health!.max);
    expect(s.events.at(-1)?.text).toContain('Blockade');
  });

  it('a strong blockade destroys the mining ship', () => {
    const { s, zone, c } = battleArena();
    for (let i = 0; i < 3; i++) spawnWarship(s, 'ai', BELT_ID, 'cruiser');
    const ship = miningShip(s, zone, c);
    launchShip(s, ship, BELT_ID);
    economyStep(s, ship.ship!.phaseEndsAt - s.time);
    expect(s.world.has(ship)).toBe(false);
  });

  it('while the game is closed, a blockade does not hit the player (offline attacks off)', () => {
    const { s, zone, c } = battleArena();
    spawnWarship(s, 'ai', BELT_ID, 'cruiser');
    const ship = miningShip(s, zone, c);
    launchShip(s, ship, BELT_ID);
    economyStep(s, ship.ship!.phaseEndsAt - s.time, { offline: true });
    expect(ship.ship?.phase).toBe('mining');
  });

  it('a transport is shot at when it lands under an enemy fleet', () => {
    const { s, zone, c } = battleArena();
    const target = otherPlanet(s);
    s.surfaces[target] = s.surfaces[zone]!;
    for (let i = 0; i < 2; i++) spawnWarship(s, 'ai', target, 'cruiser');
    const ship = spawnUnit(s, 'player', zone, 'transport', { x: c, y: c + 6 });
    s.world.addComponent(ship, 'ship', {
      phase: 'docked',
      phaseStartAt: 0,
      phaseEndsAt: 0,
      cargo: 0,
      capacity: 0,
      repeat: false,
    });
    applyCommand(s, { type: 'fly', player: 'player', shipId: ship.id, targetId: target });
    economyStep(s, ship.ship!.phaseEndsAt - s.time);
    expect(ship.health!.hp).toBe(UNITS.transport.hp - 2 * (70 - 4));
    expect(ship.zone).toBe(target);
  });
});

describe('attack from orbit', () => {
  function siege(): { s: GameState; cruiser: Entity; zone: string } {
    const { s, zone } = battleArena();
    const cruiser = spawnWarship(s, 'ai', zone, 'cruiser');
    for (const b of s.world.with('building').entities) b.health!.hp = b.health!.max = 100_000;
    return { s, cruiser, zone };
  }

  function damage(s: GameState): number {
    return s.world
      .with('building')
      .entities.filter((b) => b.owner === 'player')
      .reduce((sum, b) => sum + b.health!.max - b.health!.hp, 0);
  }

  it('only cruisers with the Orbitallaser shoot at buildings', () => {
    const { s } = siege();
    runTicks(s, 60);
    expect(damage(s)).toBe(0);
    s.players.ai!.research.done.push('orbitalLaser');
    runTicks(s, STRIKE_MS / 100 + 1);
    expect(damage(s)).toBeGreaterThan(0);
    expect(s.marks.some((m) => m.kind === 'strike')).toBe(true);
    expect(s.events.some((e) => e.text.includes('Orbit'))).toBe(true);
  });

  it('not while own war ships guard the orbit', () => {
    const { s, zone } = siege();
    s.players.ai!.research.done.push('orbitalLaser');
    const guard = spawnWarship(s, 'player', zone, 'cruiser');
    guard.health!.hp = guard.health!.max = 1e6;
    runTicks(s, 60);
    expect(damage(s)).toBe(0);
  });

  it('a shield catches the shots', () => {
    const { s, zone } = siege();
    s.players.ai!.research.done.push('orbitalLaser');
    for (const b of s.world.with('building').entities) s.world.remove(b);
    const reactor = spawnBuilding(s, 'player', zone, {
      type: 'shieldReactor',
      tileX: 30,
      tileY: 30,
      level: 1,
    });
    spawnBuilding(s, 'player', zone, { type: 'solarField', tileX: 26, tileY: 26, level: 3 });
    spawnBuilding(s, 'player', zone, { type: 'solarField', tileX: 26, tileY: 34, level: 3 });
    runTicks(s, STRIKE_MS / 100 + 1);
    expect(reactor.health!.hp).toBe(reactor.health!.max);
    expect(reactor.shield!.hp).toBeLessThan(reactor.shield!.max);
  });
});
