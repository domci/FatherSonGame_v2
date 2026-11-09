import { Group, Vector3 } from 'three/webgpu';
import type { Entity } from '../../sim/entity';
import type { SurfaceMap } from '../../sim/generation/surface';
import type { GameState } from '../../sim/state';
import { BUILDINGS } from '../../content/buildings';
import { factionOf } from '../../sim/names';
import { visualHeight } from '../terrain-shape';
import { LaserBeams } from './laser-beams';
import { Explosions } from './explosions';
import { ShieldBubbles, type BubbleInfo } from './shield-bubbles';
import type { Sight } from './surface-entities';

const LASER = { human: 0xffd84a, alien: 0x6dff7a } as const;
const SHIELD = { human: 0x5ab8ff, alien: 0x6dffa8 } as const;
const FRESH_SHOT_MS = 400;
const FRESH_MARK_MS = 1500;

/** Lasers, explosions and shield domes on one surface. Only what the player can see. */
export class SurfaceEffects {
  readonly group = new Group();
  private lasers = new LaserBeams();
  private booms = new Explosions();
  private shields = new ShieldBubbles();
  private lastShot = new Map<number, number>();
  private seenMarks = new Set<string>();

  constructor(private map: SurfaceMap) {
    this.group.add(this.lasers.group, this.booms.group, this.shields.group);
  }

  update(state: GameState, sight: Sight, dtMs: number): void {
    this.shoot(state, sight);
    this.explode(state, sight);
    this.shields.update(this.bubbles(state, sight), dtMs);
    this.lasers.update(dtMs);
    this.booms.update(dtMs);
  }

  private at(x: number, y: number, lift: number): Vector3 {
    const half = this.map.size / 2;
    return new Vector3(x - half, visualHeight(this.map, x, y) + lift, y - half);
  }

  private sees(sight: Sight, x: number, y: number): boolean {
    return sight.visible[Math.floor(y) * this.map.size + Math.floor(x)] === 1;
  }

  private shoot(state: GameState, sight: Sight): void {
    for (const e of state.world.with('attacker', 'position')) {
      const shot = e.attacker.shot;
      if (e.zone !== this.map.bodyId || !shot || e.owner === 'wild') continue;
      if (this.lastShot.get(e.id) === shot.at) continue;
      this.lastShot.set(e.id, shot.at);
      if (state.time - shot.at > FRESH_SHOT_MS) continue;
      const { x, y } = e.position;
      if (e.owner !== 'player' && !this.sees(sight, x, y) && !this.sees(sight, shot.x, shot.y))
        continue;
      const lift = e.building ? 1.5 : 0.9;
      this.lasers.fire(
        this.at(x, y, lift),
        this.at(shot.x, shot.y, 0.6),
        LASER[factionOf(state, e.owner)],
      );
    }
  }

  private explode(state: GameState, sight: Sight): void {
    const keys = new Set<string>();
    for (const m of state.marks) {
      if (m.zone !== this.map.bodyId) continue;
      const key = `${m.time}:${m.x}:${m.y}:${m.kind}`;
      keys.add(key);
      if (this.seenMarks.has(key) || state.time - m.time > FRESH_MARK_MS) continue;
      if (m.owner !== 'player' && !this.sees(sight, m.x, m.y)) continue;
      this.booms.spawn(this.at(m.x, m.y, 0.5), m.kind, m.time % 97);
    }
    this.seenMarks = keys;
  }

  private bubbles(state: GameState, sight: Sight): BubbleInfo[] {
    const out: BubbleInfo[] = [];
    for (const e of state.world.with('shield', 'position', 'building')) {
      if (!this.showsShield(e, sight)) continue;
      const size = BUILDINGS[e.building.type].size;
      const { x, y } = e.position;
      out.push({
        id: e.id,
        at: this.at(x, y, size * 0.1),
        radius: e.shield.radius,
        hp: e.shield.hp,
        max: e.shield.max,
        hitAt: e.shield.hitAt,
        color: SHIELD[factionOf(state, e.owner)],
      });
    }
    return out;
  }

  private showsShield(e: Entity, sight: Sight): boolean {
    if (!e.shield || !e.position || e.zone !== this.map.bodyId) return false;
    if (e.shield.hp <= 0 || e.construction || !e.owner || !sight.powered.has(e.owner)) return false;
    return e.owner === 'player' || this.sees(sight, e.position.x, e.position.y);
  }
}
