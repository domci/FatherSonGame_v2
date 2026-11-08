import { describe, expect, it } from 'vitest';
import { applyCommand } from './commands';
import { MINUTE, SECOND } from './clock';
import { spawnUnit } from './spawn';
import { buildingsOf, freeSpot, homeZone, newTestGame } from './test-helpers';
import { economyStep, tick } from './update';
import type { GameState } from './state';

function runTicks(s: GameState, n: number): void {
  for (let i = 0; i < n; i++) tick(s);
}

describe('training', () => {
  it('the command dome trains drones', () => {
    const s = newTestGame();
    const dome = buildingsOf(s, 'commandDome')[0];
    if (!dome) throw new Error('no dome');
    expect(
      applyCommand(s, { type: 'train', player: 'player', buildingId: dome.id, unit: 'drone' }).ok,
    ).toBe(true);
    economyStep(s, 16 * SECOND);
    expect(s.world.with('unit').entities.filter((u) => u.unit.type === 'drone')).toHaveLength(3);
  });

  it('stops when there is no housing', () => {
    const s = newTestGame();
    s.players.player!.resources = { regolith: 5000, oxygen: 500 };
    const dome = buildingsOf(s, 'commandDome')[0]!;
    const results = Array.from({ length: 6 }, () =>
      applyCommand(s, { type: 'train', player: 'player', buildingId: dome.id, unit: 'drone' }),
    );
    expect(results.filter((r) => r.ok)).toHaveLength(4);
  });
});

describe('research', () => {
  it('needs a lab and then unlocks', () => {
    const s = newTestGame();
    const cmd = { type: 'research', player: 'player', research: 'betterSolar' } as const;
    expect(applyCommand(s, cmd).ok).toBe(false);
    const spot = freeSpot(s, 'lab');
    applyCommand(s, {
      type: 'build',
      player: 'player',
      zone: homeZone(s),
      building: 'lab',
      ...spot,
    });
    economyStep(s, 4 * MINUTE);
    expect(applyCommand(s, cmd).ok).toBe(true);
    economyStep(s, 21 * SECOND);
    expect(s.players.player?.research.done).toContain('betterSolar');
  });
});

describe('spiders and hunting', () => {
  it('nests spawn spiders', () => {
    const s = newTestGame();
    runTicks(s, 5);
    expect(s.world.with('spider').entities.length).toBeGreaterThanOrEqual(2);
  });

  it('spiders attack things in their territory', () => {
    const s = newTestGame();
    runTicks(s, 5);
    const nest = s.world.with('nest').entities[0]!;
    const victim = spawnUnit(s, 'player', homeZone(s), 'drone', {
      x: nest.position!.x + 2,
      y: nest.position!.y,
    });
    runTicks(s, 300);
    expect(victim.health!.hp).toBeLessThan(victim.health!.max);
  });

  it('hunters kill spiders and get food', () => {
    const s = newTestGame();
    runTicks(s, 5);
    const spider = s.world.with('spider').entities[0]!;
    const food = s.players.player!.resources.food ?? 0;
    const hunters = [0, 1, 2].map((i) =>
      spawnUnit(s, 'player', homeZone(s), 'hunter', {
        x: spider.position!.x + i * 0.3,
        y: spider.position!.y + 2,
      }),
    );
    applyCommand(s, {
      type: 'attack',
      player: 'player',
      unitIds: hunters.map((h) => h.id),
      targetId: spider.id,
    });
    runTicks(s, 200);
    expect(s.world.has(spider)).toBe(false);
    expect(s.players.player!.resources.food ?? 0).toBeGreaterThan(food);
  });

  it('nests lay eggs over time, with a limit', () => {
    const s = newTestGame();
    economyStep(s, 60 * MINUTE);
    for (let i = 0; i < 20; i++) economyStep(s, 5 * MINUTE);
    const eggs = s.world.with('egg').entities.length;
    expect(eggs).toBeGreaterThan(0);
    expect(eggs).toBeLessThanOrEqual(8);
  });

  it('move command walks a unit to the target', () => {
    const s = newTestGame();
    const map = s.surfaces[homeZone(s)]!;
    const h = spawnUnit(s, 'player', homeZone(s), 'hunter', {
      x: map.size / 2,
      y: map.size / 2 + 4,
    });
    applyCommand(s, {
      type: 'move',
      player: 'player',
      unitIds: [h.id],
      target: { x: map.size / 2 + 6, y: map.size / 2 + 5 },
    });
    runTicks(s, 100);
    expect(h.position!.x).toBeCloseTo(map.size / 2 + 5.2, 0);
  });
});
