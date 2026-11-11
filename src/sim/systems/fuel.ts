import { UNITS } from '../../content/units';
import { addEvent } from '../game';
import type { Entity, PlayerId } from '../entity';
import type { GameState } from '../state';
import { amount } from '../wallet';
import { MINUTE } from '../clock';

/** Air planes burn gas (fuel) while they fly or fight. */
export function needsFuel(e: Entity): boolean {
  return !!e.unit && !!UNITS[e.unit.type].gasPerMinute;
}

export function hasFuel(state: GameState, owner: PlayerId | undefined): boolean {
  const player = owner ? state.players[owner] : undefined;
  return !!player && amount(player, 'gas') >= 1;
}

function isBusy(e: Entity): boolean {
  return !!e.mover || e.attacker?.targetId !== undefined;
}

/** Stops all planes of a player: no gas, no flight. */
function ground(state: GameState, planes: Entity[]): void {
  for (const p of planes) {
    if (p.mover) state.world.removeComponent(p, 'mover');
    if (p.attacker) delete p.attacker.targetId;
  }
}

/** Planes that fly or fight use gas. When the gas is gone, they stop. */
export function fuelSystem(state: GameState, dtMs: number): void {
  const busy = new Map<PlayerId, Entity[]>();
  for (const e of state.world.with('unit', 'position')) {
    if (!e.owner || e.aboard || !needsFuel(e) || !isBusy(e)) continue;
    const list = busy.get(e.owner);
    if (list) list.push(e);
    else busy.set(e.owner, [e]);
  }
  for (const [owner, planes] of busy) {
    const player = state.players[owner];
    if (!player) continue;
    const need = planes.reduce(
      (s, p) => s + (UNITS[p.unit?.type ?? 'fighter'].gasPerMinute ?? 0),
      0,
    );
    const burn = (need * dtMs) / MINUTE;
    const left = amount(player, 'gas') - burn;
    player.resources.gas = left >= 1 ? left : 0;
    if (left >= 1) continue;
    ground(state, planes);
    if (owner === 'player') addEvent(state, 'Kein Gas mehr! Eure Flugzeuge bleiben stehen.', 'bad');
  }
}
