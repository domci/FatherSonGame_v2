import { applyCommand } from '../commands';
import type { PlayerId } from '../entity';
import { BELT_ID, findBody } from '../generation/solar-system';
import { blockers, spaceTravelMs } from '../space/places';
import type { GameState } from '../state';
import { unitsOf } from './queries';

/** With this many mining ships, one of them flies to a gas planet (fuel). */
export const GAS_MINERS_FROM = 2;

/** The closest gas planet that is not blocked by enemy war ships. */
export function gasPlanet(state: GameState, owner: PlayerId): string | undefined {
  const home = state.players[owner]?.homeBodyId;
  if (!home) return undefined;
  let best: string | undefined;
  let bestMs = Infinity;
  for (const b of state.system.bodies) {
    if (b.kind !== 'gas' || blockers(state, owner, b.id).length) continue;
    const ms = spaceTravelMs(state, home, b.id, 1);
    if (ms < bestMs) [best, bestMs] = [b.id, ms];
  }
  return best;
}

function minesGas(state: GameState, target: string | undefined): boolean {
  return !!target && findBody(state.system, target)?.kind === 'gas';
}

/** Docked mining ships go to the belt (metal). One goes to a gas planet. Blocked places are left out. */
export function sendMiners(state: GameState, owner: PlayerId): void {
  const miners = unitsOf(state, owner, 'miningShip');
  let onGas = miners.some(
    (m) => m.ship?.phase !== 'docked' && minesGas(state, m.ship?.targetBodyId),
  );
  const beltFree = blockers(state, owner, BELT_ID).length === 0;
  for (const ship of miners) {
    if (ship.ship?.phase !== 'docked') continue;
    const gas = miners.length >= GAS_MINERS_FROM && !onGas ? gasPlanet(state, owner) : undefined;
    const target = gas ?? (beltFree ? BELT_ID : gasPlanet(state, owner));
    if (!target) continue;
    applyCommand(state, { type: 'sendShip', player: owner, shipId: ship.id, targetId: target });
    if (minesGas(state, target)) onGas = true;
  }
}
