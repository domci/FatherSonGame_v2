import { describe, expect, it } from 'vitest';
import { HOUR, MINUTE, SECOND } from './clock';
import { applyCommand } from './commands';
import { speedUpPrice } from './speed-up';
import { battleArena, buildingsOf, freeSpot, homeZone, newTestGame } from './test-helpers';
import { economyStep } from './update';
import { spawnBuilding } from './spawn';
import type { GameState } from './state';

function me(s: GameState) {
  const p = s.players.player;
  if (!p) throw new Error('no player');
  return p;
}

describe('speed up with knowledge crystals', () => {
  it('costs the square root of the minutes left', () => {
    expect(speedUpPrice(20 * SECOND)).toBe(1);
    expect(speedUpPrice(3 * MINUTE)).toBe(2);
    expect(speedUpPrice(20 * MINUTE)).toBe(5);
    expect(speedUpPrice(2 * HOUR)).toBe(11);
    expect(speedUpPrice(9 * HOUR)).toBe(24);
  });

  it('finishes a building now', () => {
    const s = newTestGame();
    const spot = freeSpot(s, 'storage');
    me(s).resources = { ...me(s).resources, regolith: 900, metal: 200, crystals: 10 };
    const zone = homeZone(s);
    const r0 = applyCommand(s, {
      type: 'build',
      player: 'player',
      zone,
      building: 'storage',
      ...spot,
    });
    expect(r0.ok).toBe(true);
    const site = buildingsOf(s, 'storage')[0];
    const left = (site?.construction?.finishAt ?? 0) - s.time;
    expect(left).toBeGreaterThan(SECOND);
    const r = applyCommand(s, { type: 'speedUp', player: 'player', entityId: site?.id });
    expect(r.ok).toBe(true);
    expect(me(s).resources.crystals).toBe(10 - speedUpPrice(left));
    economyStep(s, 100);
    expect(site?.building?.level).toBe(1);
  });

  it('finishes research now', () => {
    const s = newTestGame();
    me(s).research.current = { id: 'lasers', finishAt: s.time + 2 * HOUR };
    me(s).resources.crystals = 11;
    expect(applyCommand(s, { type: 'speedUp', player: 'player', research: true }).ok).toBe(true);
    economyStep(s, 100);
    expect(me(s).research.done).toContain('lasers');
    expect(me(s).resources.crystals).toBe(0);
  });

  it('finishes the unit in training, the next one keeps its time', () => {
    const s = newTestGame();
    const b = spawnBuilding(s, 'player', homeZone(s), {
      type: 'barracks',
      ...freeSpot(s, 'barracks'),
      level: 1,
    });
    s.world.addComponent(b, 'training', {
      unit: 'infantry',
      finishAt: s.time + MINUTE,
      queue: ['infantry'],
    });
    me(s).resources.crystals = 1;
    expect(applyCommand(s, { type: 'speedUp', player: 'player', entityId: b.id }).ok).toBe(true);
    economyStep(s, 100);
    expect(b.training?.queue).toEqual([]);
  });

  it('needs crystals, something that runs, and an own building', () => {
    const s = newTestGame();
    me(s).research.current = { id: 'lasers', finishAt: s.time + HOUR };
    const r = applyCommand(s, { type: 'speedUp', player: 'player', research: true });
    expect(!r.ok && r.reason).toContain('Wissenskristalle');
    delete me(s).research.current;
    me(s).resources.crystals = 99;
    expect(applyCommand(s, { type: 'speedUp', player: 'player', research: true }).ok).toBe(false);
    const arena = battleArena();
    const enemy = spawnBuilding(arena.s, 'ai', arena.zone, {
      type: 'barracks',
      tileX: arena.c,
      tileY: arena.c,
      level: 0,
    });
    arena.s.world.addComponent(enemy, 'construction', {
      targetLevel: 1,
      startedAt: 0,
      finishAt: arena.s.time + HOUR,
      droneId: 0,
    });
    const p = arena.s.players.player;
    if (p) p.resources.crystals = 99;
    const cmd = { type: 'speedUp', player: 'player', entityId: enemy.id } as const;
    expect(applyCommand(arena.s, cmd).ok).toBe(false);
  });
});
