import { MINUTE, SECOND } from '../clock';
import { sendTo } from '../commands/units';
import { addEvent, nextRandom } from '../game';
import type { Entity } from '../entity';
import { findEntity, spawn, spawnUnit } from '../spawn';
import type { GameState } from '../state';
import { distanceTo } from './combat';

const TERRITORY = 9;
const MAX_EGGS = 4;

function playerThings(state: GameState, zone: string): Entity[] {
  return state.world
    .with('health', 'position')
    .entities.filter((e) => e.owner === 'player' && e.zone === zone);
}

function nearest(
  things: Entity[],
  from: { x: number; y: number },
  maxDist: number,
): Entity | undefined {
  let best: Entity | undefined;
  let bestDist = maxDist;
  for (const t of things) {
    const d = distanceTo(from, t);
    if (d < bestDist) [best, bestDist] = [t, d];
  }
  return best;
}

function roam(state: GameState, spider: Entity, nest: Entity): void {
  if (!nest.position || spider.mover) return;
  const angle = nextRandom(state) * Math.PI * 2;
  const r = 1 + nextRandom(state) * 4;
  sendTo(state, spider, {
    x: nest.position.x + Math.cos(angle) * r,
    y: nest.position.y + Math.sin(angle) * r,
  });
}

function think(state: GameState, spider: Entity, nest: Entity | undefined): void {
  if (!spider.spider || !spider.attacker || !spider.position || !spider.zone) return;
  spider.spider.nextThinkAt = state.time + 2 * SECOND + nextRandom(state) * 2 * SECOND;
  if (!nest?.position) return;
  const intruder = nearest(playerThings(state, spider.zone), nest.position, TERRITORY);
  if (intruder) {
    if (spider.spider.mode !== 'attack' && spider.owner === 'wild') {
      addEvent(state, 'Spinnenwesen greifen an!', 'bad');
    }
    spider.spider.mode = 'attack';
    spider.attacker.targetId = intruder.id;
    return;
  }
  spider.spider.mode = 'roam';
  delete spider.attacker.targetId;
  roam(state, spider, nest);
}

function nestSpawns(state: GameState, nest: Entity): void {
  if (!nest.nest || !nest.position || !nest.zone || nest.nest.nextSpawnAt > state.time) return;
  nest.nest.nextSpawnAt = state.time + 2 * MINUTE;
  const count = state.world
    .with('spider')
    .entities.filter((s) => s.spider.nestId === nest.id).length;
  if (count >= nest.nest.maxSpiders) return;
  const s = spawnUnit(state, 'wild', nest.zone, 'spider', { ...nest.position });
  state.world.addComponent(s, 'spider', { nestId: nest.id, mode: 'roam', nextThinkAt: state.time });
}

/** Live behaviour: spiders spawn, roam and defend their territory. */
export function spiderSystem(state: GameState): void {
  for (const nest of [...state.world.with('nest')]) nestSpawns(state, nest);
  for (const s of [...state.world.with('spider')]) {
    if (s.spider.nextThinkAt <= state.time) think(state, s, findEntity(state, s.spider.nestId));
  }
}

/** Spiders lay eggs near their nest (also while offline). */
export function eggSystem(state: GameState): void {
  for (const nest of state.world.with('nest', 'position')) {
    if (nest.nest.nextEggAt > state.time || !nest.zone) continue;
    nest.nest.nextEggAt = state.time + 4 * MINUTE;
    const eggs = state.world
      .with('egg')
      .entities.filter((e) => e.zone === nest.zone && distanceTo(nest.position, e) < 4);
    if (eggs.length >= MAX_EGGS) continue;
    const a = nextRandom(state) * Math.PI * 2;
    spawn(state, {
      owner: 'wild',
      zone: nest.zone,
      position: { x: nest.position.x + Math.cos(a) * 2, y: nest.position.y + Math.sin(a) * 2 },
      egg: { laidAt: state.time },
      health: { hp: 1, max: 1 },
    });
  }
}
