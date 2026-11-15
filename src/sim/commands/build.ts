import {
  BUILDINGS,
  buildTimeSeconds,
  buildingLevel,
  type BuildingId,
} from '../../content/buildings';
import { RESOURCE_INFO } from '../../content/resources';
import type { Entity, PlayerId } from '../entity';
import { getPlayer } from '../game';
import { placementProblem } from '../occupancy';
import { hasResearch } from '../research-helpers';
import { findEntity, spawnBuilding } from '../spawn';
import type { GameState } from '../state';
import { missing, pay } from '../wallet';
import { fail, OK, type CommandResult } from './result';
import { L, fmt, joinLoc, type Loc } from '../../content/text';

export interface BuildCommand {
  type: 'build';
  player: PlayerId;
  zone: string;
  building: BuildingId;
  tileX: number;
  tileY: number;
}

export interface UpgradeCommand {
  type: 'upgrade';
  player: PlayerId;
  entityId: number;
}

const PLACE_TEXT = {
  outside: L('Das passt nicht auf die Karte.', 'That does not fit on the map.'),
  blocked: L('Der Platz ist belegt.', 'This spot is taken.'),
  needsDeposit: L(
    'Muss genau auf einem passenden Vorkommen stehen.',
    'Must stand exactly on a matching deposit.',
  ),
  tooFar: L(
    'Zu weit weg: Ein Tunnel zum nächsten Gebäude ist höchstens 9 Felder lang.',
    'Too far: a tunnel to the next building is at most 9 tiles long.',
  ),
} as const;

function freeDrone(state: GameState, owner: PlayerId, zone: string): Entity | undefined {
  return state.world
    .with('unit')
    .entities.find(
      (u) => u.owner === owner && u.zone === zone && u.unit.type === 'drone' && !u.busyWith,
    );
}

function missingText(state: GameState, owner: PlayerId, cost: Parameters<typeof missing>[1]): Loc {
  const names = missing(getPlayer(state, owner), cost).map((id) => RESOURCE_INFO[id].name);
  return fmt(L('Nicht genug {r}.', 'Not enough {r}.'), { r: joinLoc(names) });
}

/** Sends a drone to the building and starts the timer. */
function startConstruction(
  state: GameState,
  site: Entity,
  drone: Entity,
  targetLevel: number,
): void {
  if (!site.building || !site.position) return;
  const def = BUILDINGS[site.building.type];
  const seconds = buildTimeSeconds(def, targetLevel);
  state.world.addComponent(site, 'construction', {
    targetLevel,
    startedAt: state.time,
    finishAt: state.time + seconds * 1000,
    droneId: drone.id,
  });
  state.world.addComponent(drone, 'busyWith', { entityId: site.id });
  state.world.addComponent(drone, 'mover', {
    path: [{ ...site.position }],
    speed: 4,
    flying: true,
  });
}

export function build(state: GameState, cmd: BuildCommand): CommandResult {
  const def = BUILDINGS[cmd.building];
  if (def.unique)
    return fail(L('Dieses Gebäude kann man nicht bauen.', 'This building cannot be built.'));
  if (def.requires && !hasResearch(state, cmd.player, def.requires))
    return fail(L('Erst erforschen.', 'Research it first.'));
  const { zone, building, tileX, tileY } = cmd;
  const problem = placementProblem(state, zone, building, tileX, tileY, cmd.player);
  if (problem) return fail(PLACE_TEXT[problem]);
  const drone = freeDrone(state, cmd.player, cmd.zone);
  if (!drone) return fail(L('Keine freie Bau-Drohne.', 'No free builder drone.'));
  const cost = buildingLevel(def, 1).cost;
  if (!pay(getPlayer(state, cmd.player), cost)) return fail(missingText(state, cmd.player, cost));
  const site = spawnBuilding(state, cmd.player, cmd.zone, {
    type: cmd.building,
    tileX: cmd.tileX,
    tileY: cmd.tileY,
    level: 0,
  });
  startConstruction(state, site, drone, 1);
  return OK;
}

export function upgrade(state: GameState, cmd: UpgradeCommand): CommandResult {
  const site = findEntity(state, cmd.entityId);
  if (!site?.building || site.owner !== cmd.player || !site.zone)
    return fail(L('Gebäude nicht gefunden.', 'Building not found.'));
  if (site.construction) return fail(L('Wird schon gebaut.', 'Already being built.'));
  const def = BUILDINGS[site.building.type];
  const next = site.building.level + 1;
  if (next > def.levels.length) return fail(L('Höchste Stufe erreicht.', 'Highest level reached.'));
  const drone = freeDrone(state, cmd.player, site.zone);
  if (!drone) return fail(L('Keine freie Bau-Drohne.', 'No free builder drone.'));
  const cost = buildingLevel(def, next).cost;
  if (!pay(getPlayer(state, cmd.player), cost)) return fail(missingText(state, cmd.player, cost));
  startConstruction(state, site, drone, next);
  return OK;
}
