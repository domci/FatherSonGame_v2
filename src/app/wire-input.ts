import { listenPointer } from '../input/pointer';
import { handleSurfacePick, updateGhost } from '../input/pick-actions';
import type { ViewManager } from '../render/view-manager';
import type { Pick } from '../render/views/view';
import type { Session } from './session';

function onSystemPick(session: Session, pick: Pick | null): void {
  if (pick?.kind !== 'body') return;
  session.select([]);
  session.ui.selectedBodyId = pick.id;
}

/** Connects taps and mouse movement to game actions. */
export function wireInput(canvas: HTMLCanvasElement, session: Session, views: ViewManager): void {
  listenPointer(canvas, {
    onTap: (ndc, e) => {
      const pick = views.active.pick(session.state, ndc);
      if (session.ui.view === 'surface') handleSurfacePick(session, pick, e.shiftKey || e.ctrlKey);
      else if (session.ui.view === 'system') onSystemPick(session, pick);
      else if (pick) views.go('surface');
    },
    onHover: (ndc) => {
      if (session.ui.view !== 'surface' || !session.ui.placing) return;
      const pick = views.active.pick(session.state, ndc);
      if (pick?.kind === 'ground') updateGhost(session, pick.x, pick.y);
    },
  });
}
