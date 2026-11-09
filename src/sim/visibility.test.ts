import { describe, expect, it } from 'vitest';
import { spawnUnit } from './spawn';
import { homeZone, newTestGame } from './test-helpers';
import { canSee, explore, visibleTiles } from './visibility';
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
});
