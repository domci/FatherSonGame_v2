import type { GameState } from '../sim/state';
import { tick, TICK_MS } from '../sim/update';
import { toSaveData } from '../sim/save/save';
import { createRenderer } from '../render/renderer';
import { ViewManager } from '../render/view-manager';
import { exportSave } from '../platform/storage';
import { Hud } from '../ui/hud';
import { BuildMenu } from '../ui/build-menu';
import { InfoPanel } from '../ui/info-panel';
import { Toasts } from '../ui/toasts';
import { pauseMenu } from '../ui/main-menu';
import { el } from '../ui/dom';
import { Session } from './session';
import { startLoop } from './loop';
import { wireInput } from './wire-input';
import { exposeDebug } from './debug';
import { makeProjector } from './screen-pos';
import { Bars } from '../ui/bars';

const AUTOSAVE_MS = 2 * 60 * 1000;

function openMenu(root: HTMLElement, session: Session, onQuit: () => void): void {
  const menu = pauseMenu({
    resume: () => menu.remove(),
    save: () => void session.save().then(() => session.onMessage('Gespeichert.', 'good')),
    exportFile: () => exportSave(toSaveData(session.state, Date.now())),
    quit: () => void session.save().then(onQuit),
  });
  root.append(menu);
}

function startAutosave(session: Session): void {
  window.setInterval(() => void session.save(), AUTOSAVE_MS);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) void session.save();
  });
}

/** Starts one game: canvas, 3D views, HUD, input, loop and autosave. */
export async function startGame(
  root: HTMLElement,
  state: GameState,
  onQuit: () => void,
): Promise<Session> {
  const session = new Session(state);
  const canvas = el('canvas', { class: 'game-canvas' });
  const fade = el('div', { class: 'fade' });
  root.replaceChildren(canvas, fade);
  const views = new ViewManager(state, await createRenderer(canvas), canvas, fade);
  views.onChange = (name) => {
    session.ui.view = name;
    session.startPlacing(undefined);
  };
  const hud = new Hud(session, {
    goView: (n) => views.go(n),
    openMenu: () => openMenu(root, session, onQuit),
  });
  const parts = [hud, new BuildMenu(session), new InfoPanel(session), new Toasts(session)];
  const bars = new Bars(makeProjector(session, views, canvas));
  root.append(bars.root, ...parts.map((p) => p.root));
  wireInput(canvas, session, views);
  const resize = (): void => views.resize(root.clientWidth, root.clientHeight);
  window.addEventListener('resize', resize);
  resize();
  startLoop({
    tickMs: TICK_MS,
    speed: () => session.speed,
    tick: () => tick(session.state),
    frame: (dt) => {
      views.frame(session.state, session.ui, dt);
      bars.update(session.state, session.ui.selectedIds);
    },
    slow: () => parts.forEach((p) => p.update()),
  });
  startAutosave(session);
  exposeDebug(session, makeProjector(session, views, canvas));
  return session;
}
