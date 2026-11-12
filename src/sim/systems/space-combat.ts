import { tell, tellHumans } from '../humans';
import type { Entity, PlayerId } from '../entity';
import { weaponHits } from '../layers';
import { nameOfUnit } from '../names';
import { hostile } from '../relations';
import { warships } from '../space/places';
import type { GameState } from '../state';
import { dealDamage, hitDamage } from './damage';
import { placeName } from './fleet';

/** Who fights at one place: war ships, ground cannons that shoot into orbit, mining ships. */
interface Place {
  shooters: Entity[];
  targets: Entity[];
}

function placeOf(map: Map<string, Place>, id: string): Place {
  let p = map.get(id);
  if (!p) {
    p = { shooters: [], targets: [] };
    map.set(id, p);
  }
  return p;
}

function gather(state: GameState): Map<string, Place> {
  const map = new Map<string, Place>();
  for (const s of warships(state)) {
    if (!s.orbit || s.orbit.to) continue;
    const p = placeOf(map, s.orbit.at);
    p.shooters.push(s);
    p.targets.push(s);
  }
  for (const b of state.world.with('building', 'attacker')) {
    if (b.zone && !b.construction && weaponHits(b) === 'space')
      placeOf(map, b.zone).shooters.push(b);
  }
  for (const m of state.world.with('ship')) {
    const t = m.ship.targetBodyId;
    if (m.ship.phase === 'mining' && t) placeOf(map, t).targets.push(m);
  }
  return map;
}

/** War ships first, then the weakest. */
function pick(state: GameState, targets: Entity[], shooter: PlayerId): Entity | undefined {
  let best: Entity | undefined;
  let bestScore = Infinity;
  for (const t of targets) {
    if (!t.health || !state.world.has(t) || !hostile(state, shooter, t.owner)) continue;
    const score = (t.orbit ? 0 : 1e6) + t.health.hp;
    if (score < bestScore) [best, bestScore] = [t, score];
  }
  return best;
}

function report(state: GameState, dead: Entity, place: string): void {
  if (!dead.unit || !dead.owner) return;
  const name = nameOfUnit(state, dead.owner, dead.unit.type);
  const where = placeName(state, place);
  const owner = dead.owner;
  tell(state, owner, `${name} bei ${where} zerstört!`, 'bad');
  tellHumans(state, (h) =>
    hostile(state, h, owner) ? [`Feind-${name} bei ${where} zerstört.`, 'good'] : undefined,
  );
}

function shoot(state: GameState, shooter: Entity, target: Entity, place: string): void {
  if (!shooter.attacker) return;
  shooter.attacker.readyAt = state.time + shooter.attacker.cooldownMs;
  shooter.attacker.targetId = target.id;
  shooter.attacker.shot = { at: state.time, x: 0, y: 0 };
  dealDamage(state, target, hitDamage(state, shooter, target), shooter);
  if (!state.world.has(target)) report(state, target, place);
}

/** War ships at the same place fight. Cannons on the ground shoot at ships above them. */
export function spaceCombatSystem(state: GameState): void {
  for (const [place, p] of gather(state)) {
    for (const shooter of p.shooters) {
      const a = shooter.attacker;
      if (!a || !shooter.owner || a.readyAt > state.time || !state.world.has(shooter)) continue;
      const target = pick(state, p.targets, shooter.owner);
      if (target) shoot(state, shooter, target, place);
      else delete a.targetId;
    }
  }
}
