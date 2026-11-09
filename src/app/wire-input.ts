import { listenPointer } from '../input/pointer';
import { listenBox, type Rect } from '../input/box-select';
import { handleSurfacePick, updateGhost } from '../input/pick-actions';
import type { ViewManager } from '../render/view-manager';
import type { Pick } from '../render/views/view';
import type { Session } from './session';
import { toNdc } from '../input/pointer';
import type { Vector2 } from 'three/webgpu';
import type { Projector } from './screen-pos';

function onSystemPick(session: Session, pick: Pick | null): void {
  if (pick?.kind !== 'body') return;
  session.select([]);
  session.ui.selectedBodyId = pick.id;
}

/** Selects all own fighting units inside a screen rectangle (not drones or ships). */
function selectInBox(session: Session, project: Projector, r: Rect): void {
  const ids: number[] = [];
  for (const u of session.state.world.with('unit', 'position')) {
    if (u.owner !== 'player' || u.zone !== session.ui.zone || u.ship || !u.attacker) continue;
    const p = project(u.position.x, u.position.y, 0.5);
    if (p && p.x >= r.left && p.x <= r.right && p.y >= r.top && p.y <= r.bottom) ids.push(u.id);
  }
  session.select(ids);
  session.ui.boxMode = false;
}

/** Connects taps, boxes and mouse movement to game actions. */
export function wireInput(
  canvas: HTMLCanvasElement,
  session: Session,
  views: ViewManager,
  project: Projector,
): void {
  const onTap = (ndc: Vector2, e: PointerEvent): void => {
    const pick = views.active.pick(session.state, ndc);
    if (session.ui.view === 'surface') handleSurfacePick(session, pick, e.shiftKey || e.ctrlKey);
    else if (session.ui.view === 'system') onSystemPick(session, pick);
    else if (pick) views.go('surface');
  };
  listenBox(canvas, document.body, {
    wants: (e) =>
      session.ui.view === 'surface' && !session.ui.placing && (e.shiftKey || !!session.ui.boxMode),
    done: (r) => selectInBox(session, project, r),
    tap: (e) => onTap(toNdc(canvas, e), e),
  });
  listenPointer(canvas, {
    onTap,
    onHover: (ndc) => {
      if (session.ui.view !== 'surface' || !session.ui.placing) return;
      const pick = views.active.pick(session.state, ndc);
      if (pick?.kind === 'ground') updateGhost(session, pick.x, pick.y);
    },
  });
}
