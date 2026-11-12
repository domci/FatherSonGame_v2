import { Group, Vector3, type Object3D } from 'three/webgpu';
import type { Entity } from '../../sim/entity';
import { BELT_ID } from '../../sim/generation/solar-system';
import { factionOf } from '../../sim/names';
import { findEntity } from '../../sim/spawn';
import { placePos } from '../../sim/space/places';
import type { GameState } from '../../sim/state';
import { unitModel } from '../models/unit-models';
import { LaserBeams } from './laser-beams';
import { shipPose } from './ship-path';
import type { SpaceBody } from './space-bodies';

const LASER = { human: 0xffd84a, alien: 0x6dff7a } as const;
/** Each side's fleet waits on its own side of a planet (player, ai, ai2, ai3). */
const SIDE_ANGLE: Record<string, number> = {
  player: 0,
  ai: Math.PI,
  ai2: Math.PI / 2,
  ai3: -Math.PI / 2,
};
const FRESH_MS = 300;
/** War ships in orbit are drawn small next to their planet; flying ones like mining ships. */
const ORBIT_SCALE = 0.5;
const FLY_SCALE = 1.2;

/** War ships in orbit or on their way, and their laser shots. */
export class SpaceFleet {
  readonly group = new Group();
  private ships = new Map<number, Object3D>();
  private beams = new LaserBeams();
  private lastShot = new Map<number, number>();
  private seenStrikes = new Set<string>();

  constructor(private bodies: Map<string, SpaceBody>) {
    this.group.add(this.beams.group);
  }

  update(state: GameState, dtMs: number): void {
    const seen = new Set<number>();
    const slots = new Map<string, number>();
    for (const e of state.world.with('orbit')) {
      seen.add(e.id);
      const obj = this.ensure(state, e);
      const key = `${e.orbit.at}:${e.owner}`;
      const slot = slots.get(key) ?? 0;
      slots.set(key, slot + 1);
      this.place(state, e, obj, slot);
    }
    for (const [id, obj] of this.ships) {
      if (seen.has(id)) continue;
      this.group.remove(obj);
      this.ships.delete(id);
    }
    this.shoot(state);
    this.strikes(state);
    this.beams.update(dtMs);
  }

  private ensure(state: GameState, e: Entity): Object3D {
    let obj = this.ships.get(e.id);
    if (!obj && e.unit) {
      obj = new Group();
      obj.add(unitModel(e.unit.type, factionOf(state, e.owner)));
      this.ships.set(e.id, obj);
      this.group.add(obj);
    }
    return obj ?? new Group();
  }

  /** Where a place is in the 3D scene, and how big its planet is. */
  private placeAt(state: GameState, id: string, out: Vector3): number {
    const body = this.bodies.get(id);
    if (body) {
      out.copy(body.group.position);
      return body.body.radius;
    }
    const home = this.bodies.get(state.system.homeBodyId)?.group.position;
    const p = placePos(state, BELT_ID, home ? { x: home.x, y: home.z } : undefined);
    out.set(p.x, 0, p.y);
    return 1;
  }

  private place(state: GameState, e: Entity, obj: Object3D, slot: number): void {
    const o = e.orbit;
    if (!o) return;
    const at = new Vector3();
    const r = this.placeAt(state, o.at, at);
    obj.scale.setScalar(o.to ? FLY_SCALE : ORBIT_SCALE);
    if (o.to) {
      const to = new Vector3();
      this.placeAt(state, o.to, to);
      const p = Math.min(
        1,
        Math.max(0, (state.time - o.departAt) / Math.max(1, o.arriveAt - o.departAt)),
      );
      obj.position.copy(at).lerp(to, p);
      obj.position.y = 0.6;
      obj.rotation.y = Math.atan2(to.x - at.x, to.z - at.z);
      return;
    }
    const side = SIDE_ANGLE[e.owner ?? 'ai'] ?? Math.PI;
    const a = state.time / 9000 + slot * 0.8 + side;
    const d = r * 1.7 + 0.35 + (slot % 3) * 0.12;
    obj.position.set(at.x + Math.cos(a) * d, at.y + 0.2 * Math.sin(slot), at.z + Math.sin(a) * d);
    obj.rotation.y = -a;
  }

  /** Where a shooter or target is drawn (war ship, mining ship or a cannon's planet). */
  private posOf(state: GameState, e: Entity, out: Vector3): boolean {
    const obj = this.ships.get(e.id);
    if (obj) return !!out.copy(obj.position);
    if (e.ship) {
      const pose = shipPose(state, e);
      if (pose) return !!out.set(pose.x, 0.8, pose.y);
    }
    if (e.building && e.zone) {
      const r = this.placeAt(state, e.zone, out);
      out.y += r;
      return true;
    }
    return false;
  }

  private shoot(state: GameState): void {
    const from = new Vector3();
    const to = new Vector3();
    for (const e of state.world.with('attacker')) {
      const shot = e.attacker.shot;
      if (!shot || (!e.orbit && !(e.building && e.attacker.range === 0))) continue;
      if (this.lastShot.get(e.id) === shot.at || state.time - shot.at > FRESH_MS) continue;
      this.lastShot.set(e.id, shot.at);
      const target =
        e.attacker.targetId === undefined ? undefined : findEntity(state, e.attacker.targetId);
      if (!target || !this.posOf(state, e, from) || !this.posOf(state, target, to)) continue;
      this.beams.fire(from, to, LASER[factionOf(state, e.owner)], 0.05);
    }
  }

  /** Shots from orbit: a beam from a cruiser down to the planet. */
  private strikes(state: GameState): void {
    const keys = new Set<string>();
    for (const m of state.marks) {
      if (m.kind !== 'strike') continue;
      const key = `${m.time}:${m.x}:${m.y}`;
      keys.add(key);
      if (this.seenStrikes.has(key) || state.time - m.time > FRESH_MS) continue;
      const ship = state.world
        .with('orbit')
        .entities.find((s) => s.owner === m.owner && s.orbit.at === m.zone && !s.orbit.to);
      const from = new Vector3();
      const to = new Vector3();
      if (!ship || !this.posOf(state, ship, from)) continue;
      this.placeAt(state, m.zone, to);
      this.beams.fire(from, to, LASER[factionOf(state, m.owner)], 0.12, 500);
    }
    this.seenStrikes = keys;
  }
}
