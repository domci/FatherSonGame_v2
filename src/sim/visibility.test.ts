import { describe, expect, it } from 'vitest';
import { spawnUnit } from './spawn';
import { homeZone, newBattleGame, newTestGame } from './test-helpers';
import { canSee, canViewSurface, explore, radarSees, visibleTiles } from './visibility';
import { tick } from './update';

describe('fog of war', () => {
  it('only tiles near own things are visible', () => {
    const s = newTestGame();
    const zone = homeZone(s);
    const size = s.surfaces[zone]!.size;
    const vis = visibleTiles(s, 'player', zone);
    const c = size / 2;
    expect(vis[c * size + c]).toBe(1);
    expect(vis[1 * size + 1]).toBe(0);
    const spider = s.world.with('nest').entities[0]!;
    expect(canSee(vis, size, spider)).toBe(false);
  });

  it('a scout reveals more and the map remembers it', () => {
    const s = newTestGame();
    const zone = homeZone(s);
    const size = s.surfaces[zone]!.size;
    const scout = spawnUnit(s, 'player', zone, 'infantry', { x: 3, y: 3 });
    const explored = explore(s, 'player', zone, visibleTiles(s, 'player', zone));
    expect(explored[3 * size + 3]).toBe(1);
    s.world.remove(scout);
    const later = explore(s, 'player', zone, visibleTiles(s, 'player', zone));
    expect(later[3 * size + 3]).toBe(1);
    expect(visibleTiles(s, 'player', zone)[3 * size + 3]).toBe(0);
    expect(s.players.player!.explored![zone]).toHaveLength(size * size);
  });

  it('is updated while playing', () => {
    const s = newTestGame();
    for (let i = 0; i < 6; i++) tick(s);
    expect(s.players.player!.explored![homeZone(s)]).toContain('1');
  });

  it('the enemy planet can be viewed only with own units there or with the radar', () => {
    const s = newBattleGame();
    const enemy = s.system.alienBodyId;
    const other = s.system.bodies.find((b) => b.id !== enemy && b.id !== homeZone(s))!.id;
    expect(canViewSurface(s, 'player', homeZone(s))).toBe(true);
    expect(canViewSurface(s, 'player', enemy)).toBe(false);
    expect(canViewSurface(s, 'player', other)).toBe(false);
    const scout = spawnUnit(s, 'player', enemy, 'infantry', { x: 3, y: 3 });
    expect(canViewSurface(s, 'player', enemy)).toBe(true);
    s.world.remove(scout);
    expect(radarSees(s, 'player', enemy)).toBe(false);
    s.players.player!.research.done.push('radar');
    expect(radarSees(s, 'player', enemy)).toBe(true);
    expect(canViewSurface(s, 'player', enemy)).toBe(true);
    expect(radarSees(s, 'player', homeZone(s))).toBe(false);
  });
});
