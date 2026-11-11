import { Group, Vector3 } from 'three/webgpu';
import type { Entity } from '../../sim/entity';
import type { SurfaceMap } from '../../sim/generation/surface';
import type { GameState, Mark } from '../../sim/state';
import { BUILDINGS } from '../../content/buildings';
import { factionOf } from '../../sim/names';
import { visualHeight } from '../terrain-shape';
import { LaserBeams } from './laser-beams';
import { AIR_HEIGHT, flies } from './air';
import { Explosions } from './explosions';
import { ShieldBubbles, type BubbleInfo } from './shield-bubbles';
import type { Sight } from './surface-entities';
import { SteamPuffs } from './steam-puffs';

const LASER = { human: 0xffd84a, alien: 0x6dff7a } as const;
const SHIELD = { human: 0x5ab8ff, alien: 0x6dffa8 } as const;
/** Bombs fall as a hot orange streak. */
const BOMB = 0xff8a3d;
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
  private steam: SteamPuffs;

  constructor(private map: SurfaceMap) {
    this.steam = new SteamPuffs(map);
    this.group.add(this.lasers.group, this.booms.group, this.shields.group, this.steam.group);
  }

  update(state: GameState, sight: Sight, dtMs: number): void {
    this.shoot(state, sight);
    this.explode(state, sight);
    this.shields.update(this.bubbles(state, sight), dtMs);
    this.lasers.update(dtMs);
    this.booms.update(dtMs);
    this.steam.update(state, sight, dtMs);
  }

  private at(x: number, y: number, lift: number): Vector3 {
    const half = this.map.size / 2;
    return new Vector3(x - half, visualHeight(this.map, x, y) + lift, y - half);
  }

  private sees(sight: Sight, x: number, y: number): boolean {
    return sight.visible[Math.floor(y) * this.map.size + Math.floor(x)] === 1;
  }

  /** A new shot that the player may see (own, or in sight). */
  private newShot(state: GameState, sight: Sight, e: Entity): boolean {
    const shot = e.attacker?.shot;
    if (e.zone !== this.map.bodyId || !shot || !e.position || e.owner === 'wild') return false;
    if (this.lastShot.get(e.id) === shot.at) return false;
    this.lastShot.set(e.id, shot.at);
    if (state.time - shot.at > FRESH_SHOT_MS) return false;
    if (e.owner === 'player') return true;
    return this.sees(sight, e.position.x, e.position.y) || this.sees(sight, shot.x, shot.y);
  }

  private shoot(state: GameState, sight: Sight): void {
    for (const e of state.world.with('attacker', 'position')) {
      const shot = e.attacker.shot;
      if (!shot || !this.newShot(state, sight, e)) continue;
      const lift = flies(e) ? AIR_HEIGHT : e.building ? 1.5 : 0.9;
      const from = this.at(e.position.x, e.position.y, lift);
      const to = this.at(shot.x, shot.y, shot.air ? AIR_HEIGHT : 0.6);
      if (e.unit?.type === 'bomber') this.lasers.fire(from, to, BOMB, 0.14, 380);
      else this.lasers.fire(from, to, LASER[factionOf(state, e.owner)]);
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
      if (m.kind === 'strike') this.skyBeam(state, m.x, m.y, m.owner);
    }
    this.seenMarks = keys;
  }

  /** A thick laser from a ship in orbit, straight down from the sky. */
  private skyBeam(state: GameState, x: number, y: number, owner: Mark['owner']): void {
    const to = this.at(x, y, 0.3);
    const from = to.clone().add(new Vector3(6, 60, -4));
    this.lasers.fire(from, to, LASER[factionOf(state, owner)], 0.35, 700);
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
