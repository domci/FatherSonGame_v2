import { describe, expect, it } from 'vitest';
import { applyCommand } from './commands';
import { HOUR, MINUTE, SECOND } from './clock';
import { buildingsOf, drones, freeSpot, homeZone, newTestGame } from './test-helpers';
import { catchUp, economyStep, tick } from './update';
import { playerStats } from './stats';
import type { GameState } from './state';
import type { BuildingId } from '../content/buildings';

function buildAndFinish(state: GameState, type: BuildingId): void {
  const spot = freeSpot(state, type);
  const r = applyCommand(state, {
    type: 'build',
    player: 'player',
    zone: homeZone(state),
    building: type,
    ...spot,
  });
  expect(r).toEqual({ ok: true });
  const site = buildingsOf(state, type).find((b) => b.construction);
  economyStep(state, (site?.construction?.finishAt ?? state.time) - state.time);
}

describe('new game', () => {
  it('starts with a command dome, two drones and two nests', () => {
    const s = newTestGame();
    expect(buildingsOf(s, 'commandDome')).toHaveLength(1);
    expect(drones(s)).toHaveLength(2);
    expect(s.world.with('nest').entities).toHaveLength(2);
  });

  it('is the same for the same seed', () => {
    const a = newTestGame(5);
    const b = newTestGame(5);
    for (let i = 0; i < 300; i++) {
      tick(a);
      tick(b);
    }
    expect(JSON.stringify(a.world.entities)).toBe(JSON.stringify(b.world.entities));
  });
});

describe('building', () => {
  it('costs resources and takes time', () => {
    const s = newTestGame();
    const before = s.players.player?.resources.regolith ?? 0;
    const spot = freeSpot(s, 'solarField');
    applyCommand(s, {
      type: 'build',
      player: 'player',
      zone: homeZone(s),
      building: 'solarField',
      ...spot,
    });
    expect(s.players.player?.resources.regolith).toBe(before - 60);
    const site = buildingsOf(s, 'solarField')[0];
    expect(site?.building?.level).toBe(0);
    economyStep(s, 10 * SECOND);
    expect(site?.building?.level).toBe(0);
    economyStep(s, 15 * SECOND);
    expect(site?.building?.level).toBe(1);
  });

  it('needs a free drone for each job', () => {
    const s = newTestGame();
    const zone = homeZone(s);
    const { tileX, tileY } = s.surfaces[zone]!.landing;
    const place = (x: number) =>
      applyCommand(s, {
        type: 'build',
        player: 'player',
        zone,
        building: 'solarField',
        tileX: tileX + x,
        tileY: tileY + 6,
      });
    expect(place(-3).ok).toBe(true);
    expect(place(0).ok).toBe(true);
    expect(place(3)).toEqual({ ok: false, reason: 'Keine freie Bau-Drohne.' });
  });

  it('new buildings must be close enough for a tunnel; walls may stand alone', () => {
    const s = newTestGame();
    const zone = homeZone(s);
    const { tileX, tileY } = s.surfaces[zone]!.landing;
    const far = { type: 'build', player: 'player', zone, tileX: tileX + 16, tileY } as const;
    expect(applyCommand(s, { ...far, building: 'solarField' }).ok).toBe(false);
    expect(applyCommand(s, { ...far, building: 'solarField' })).toEqual({
      ok: false,
      reason: expect.stringContaining('Tunnel') as string,
    });
    expect(applyCommand(s, { ...far, building: 'wall' }).ok).toBe(true);
    const near = { ...far, tileX: tileX + 10, building: 'solarField' } as const;
    expect(applyCommand(s, near).ok).toBe(true);
  });

  it('rejects blocked places and missing deposits', () => {
    const s = newTestGame();
    const { tileX, tileY } = s.surfaces[homeZone(s)]?.landing ?? { tileX: 0, tileY: 0 };
    const r = applyCommand(s, {
      type: 'build',
      player: 'player',
      zone: homeZone(s),
      building: 'solarField',
      tileX,
      tileY,
    });
    expect(r.ok).toBe(false);
    const r2 = applyCommand(s, {
      type: 'build',
      player: 'player',
      zone: homeZone(s),
      building: 'pinkPump',
      tileX: 1,
      tileY: 1,
    });
    expect(r2).toEqual({ ok: false, reason: 'Muss genau auf einem passenden Vorkommen stehen.' });
  });

  it('upgrades take longer each level', () => {
    const s = newTestGame();
    buildAndFinish(s, 'solarField');
    const solar = buildingsOf(s, 'solarField')[0];
    if (!solar) throw new Error('no solar');
    applyCommand(s, { type: 'upgrade', player: 'player', entityId: solar.id });
    const c = solar.construction;
    expect(c && c.finishAt - c.startedAt).toBe(3 * MINUTE);
  });
});

describe('energy and production', () => {
  it('an excavator makes regolith', () => {
    const s = newTestGame();
    buildAndFinish(s, 'regolithExcavator');
    const before = s.players.player?.resources.regolith ?? 0;
    economyStep(s, 10 * MINUTE);
    expect((s.players.player?.resources.regolith ?? 0) - before).toBeGreaterThan(200);
  });

  it('missing energy slows buildings down', () => {
    const s = newTestGame();
    for (let i = 0; i < 4; i++) buildAndFinish(s, 'regolithExcavator');
    const stats = playerStats(s, 'player');
    expect(stats.energyUsed).toBe(16);
    expect(stats.efficiency).toBeLessThanOrEqual(1);
  });

  it('pink liquid turns into water and oxygen', () => {
    const s = newTestGame();
    buildAndFinish(s, 'solarField');
    buildAndFinish(s, 'pinkPump');
    buildAndFinish(s, 'waterOxygenPlant');
    const w = s.players.player?.resources.water ?? 0;
    economyStep(s, 10 * MINUTE);
    expect(s.players.player?.resources.water ?? 0).toBeGreaterThan(w);
  });

  it('storage limits resources', () => {
    const s = newTestGame();
    buildAndFinish(s, 'regolithExcavator');
    economyStep(s, 100 * HOUR);
    expect(s.players.player?.resources.regolith).toBeLessThanOrEqual(
      playerStats(s, 'player').storage,
    );
  });
});

describe('offline progress', () => {
  it('finishes building and produces while away for two days', () => {
    const s = newTestGame();
    const spot = freeSpot(s, 'regolithExcavator');
    applyCommand(s, {
      type: 'build',
      player: 'player',
      zone: homeZone(s),
      building: 'regolithExcavator',
      ...spot,
    });
    const report = catchUp(s, 48 * HOUR);
    expect(buildingsOf(s, 'regolithExcavator')[0]?.building?.level).toBe(1);
    expect(report.gained.regolith ?? 0).toBeGreaterThan(0);
  });
});
