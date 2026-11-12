import { BUILDINGS } from '../content/buildings';
import type { Session } from '../app/session';
import { placementProblem } from '../sim/occupancy';
import { hostile } from '../sim/relations';
import { findEntity } from '../sim/spawn';
import type { Pick } from '../render/views/view';

/** Top-left tile for a building centered on the pointer. */
export function tileFor(
  session: Session,
  x: number,
  y: number,
): { tileX: number; tileY: number } | null {
  const type = session.ui.placing;
  if (!type) return null;
  const size = BUILDINGS[type].size;
  return { tileX: Math.round(x - size / 2), tileY: Math.round(y - size / 2) };
}

export function updateGhost(session: Session, x: number, y: number): void {
  const type = session.ui.placing;
  const tile = tileFor(session, x, y);
  if (!type || !tile) return;
  const { tileX, tileY } = tile;
  const ok = !placementProblem(session.state, session.ui.zone, type, tileX, tileY, 'player');
  session.ui.ghost = { type, ...tile, ok };
}

function place(session: Session, x: number, y: number): void {
  const type = session.ui.placing;
  const tile = tileFor(session, x, y);
  if (!type || !tile) return;
  const zone = session.ui.zone;
  if (session.command({ type: 'build', player: 'player', zone, building: type, ...tile }))
    session.startPlacing(undefined);
}

function selectedUnits(session: Session): number[] {
  return [...session.ui.selectedIds].filter((id) => findEntity(session.state, id)?.unit);
}

function onEntity(session: Session, id: number, additive: boolean): void {
  const target = findEntity(session.state, id);
  if (!target) return;
  const units = selectedUnits(session).filter((u) => u !== id);
  if (hostile(session.state, 'player', target.owner) && units.length > 0) {
    session.command({ type: 'attack', player: 'player', unitIds: units, targetId: id });
    return;
  }
  if (target.unit?.type === 'transport' && target.owner === 'player' && units.length > 0) {
    if (session.command({ type: 'board', player: 'player', shipId: id, unitIds: units }))
      session.select([id]);
    return;
  }
  if (additive && target.unit && target.owner === 'player') session.select([...units, id]);
  else session.select([id]);
}

function onGround(session: Session, x: number, y: number): void {
  const units = selectedUnits(session);
  if (units.length === 0) return session.select([]);
  session.command({ type: 'move', player: 'player', unitIds: units, target: { x, y } });
}

/** What happens when the player taps something on the surface. */
export function handleSurfacePick(session: Session, pick: Pick | null, additive: boolean): void {
  if (!pick) return;
  if (session.ui.placing) {
    if (pick.kind === 'ground') place(session, pick.x, pick.y);
    return;
  }
  if (pick.kind === 'entity') onEntity(session, pick.id, additive);
  else if (pick.kind === 'ground') onGround(session, pick.x, pick.y);
}
