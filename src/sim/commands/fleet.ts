import { UNITS } from '../../content/units';
import type { Entity, PlayerId } from '../entity';
import type { GameState } from '../state';
import { isPlace, spaceTravelMs, warships } from '../space/places';
import { fail, OK, type CommandResult } from './result';

export interface FleetCommand {
  type: 'fleet';
  player: PlayerId;
  /** Planet id or 'belt'. */
  targetId: string;
  /** Only these ships (default: all war ships that wait somewhere). */
  shipIds?: number[];
}

function waiting(e: Entity, player: PlayerId, ids: Set<number> | undefined): boolean {
  return e.owner === player && !!e.orbit && !e.orbit.to && (!ids || ids.has(e.id));
}

/** Slowest speed of the ships that start at each place: they fly together. */
function groupSpeeds(ships: Entity[]): Map<string, number> {
  const speeds = new Map<string, number>();
  for (const e of ships) {
    if (!e.orbit || !e.unit) continue;
    const speed = UNITS[e.unit.type].speed;
    speeds.set(e.orbit.at, Math.min(speed, speeds.get(e.orbit.at) ?? speed));
  }
  return speeds;
}

/** Sends war ships to a planet or the belt. Ships from one place stay together. */
export function fleet(state: GameState, cmd: FleetCommand): CommandResult {
  if (!isPlace(state, cmd.targetId)) return fail('Ziel unbekannt.');
  const ids = cmd.shipIds ? new Set(cmd.shipIds) : undefined;
  const ready = warships(state).filter((e) => waiting(e, cmd.player, ids));
  if (ready.length === 0) return fail('Keine freien Kampfschiffe.');
  const go = ready.filter((e) => e.orbit?.at !== cmd.targetId);
  if (go.length === 0) return fail('Die Flotte ist schon dort.');
  const speeds = groupSpeeds(go);
  for (const ship of go) {
    if (!ship.orbit) continue;
    const speed = speeds.get(ship.orbit.at) ?? 1;
    ship.orbit.to = cmd.targetId;
    ship.orbit.departAt = state.time;
    ship.orbit.arriveAt = state.time + spaceTravelMs(state, ship.orbit.at, cmd.targetId, speed);
    delete ship.orbit.strikeAt;
  }
  return OK;
}
