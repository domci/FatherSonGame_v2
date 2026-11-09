import { BUILDINGS, buildingLevel } from '../../content/buildings';
import { UNITS } from '../../content/units';
import { addEvent, nextRandom } from '../game';
import { nameOfBuilding, nameOfUnit } from '../names';
import { equipBuilding, findEntity, spawnUnit } from '../spawn';
import type { Entity } from '../entity';
import type { GameState } from '../state';

function finishConstruction(state: GameState, site: Entity): void {
  if (!site.building || !site.construction) return;
  const def = BUILDINGS[site.building.type];
  const level = site.construction.targetLevel;
  site.building.level = level;
  const max = buildingLevel(def, level).hp;
  site.health = { hp: max, max };
  equipBuilding(state, site);
  const drone = findEntity(state, site.construction.droneId);
  if (drone?.busyWith) state.world.removeComponent(drone, 'busyWith');
  state.world.removeComponent(site, 'construction');
  if (site.owner === 'player') {
    addEvent(
      state,
      `${nameOfBuilding(state, site.owner, def.id)} fertig${level > 1 ? ` (Stufe ${level})` : ''}.`,
      'good',
    );
  }
}

/** Finishes buildings whose timer has run out. */
export function constructionSystem(state: GameState): void {
  for (const site of [...state.world.with('construction')]) {
    if (site.construction.finishAt <= state.time) finishConstruction(state, site);
  }
}

function spawnTrained(state: GameState, b: Entity, unit: Entity['unit'] & object): void {
  if (!b.owner || !b.zone || !b.position || !b.building) return;
  const size = BUILDINGS[b.building.type].size;
  const at = {
    x: b.position.x + (nextRandom(state) - 0.5) * size,
    y: b.position.y + size / 2 + 0.8,
  };
  const e = spawnUnit(state, b.owner, b.zone, unit.type, at);
  if (unit.type === 'miningShip' || unit.type === 'transport') {
    state.world.addComponent(e, 'ship', {
      phase: 'docked',
      phaseStartAt: state.time,
      phaseEndsAt: state.time,
      cargo: 0,
      capacity: unit.type === 'miningShip' ? 100 : 0,
      repeat: false,
      fromBodyId: b.zone,
    });
    e.position = { ...b.position };
  }
  if (b.owner === 'player')
    addEvent(state, `${nameOfUnit(state, b.owner, unit.type)} bereit.`, 'good');
}

/** Finishes units in training queues. Works for long offline times too. */
export function trainingSystem(state: GameState): void {
  for (const b of [...state.world.with('training')]) {
    while (b.training && b.training.finishAt <= state.time) {
      spawnTrained(state, b, { type: b.training.unit });
      const next = b.training.queue.shift();
      if (next) {
        b.training.unit = next;
        b.training.finishAt += UNITS[next].trainSeconds * 1000;
      } else {
        state.world.removeComponent(b, 'training');
      }
    }
  }
}
