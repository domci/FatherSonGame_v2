import type { GameState } from '../sim/state';
import { tick, TICK_MS } from '../sim/update';
import { createRenderer } from '../render/renderer';
import { ViewManager } from '../render/view-manager';
import { loadKit } from '../render/models/kit';
import { loadingScreen } from '../ui/main-menu';
import { el } from '../ui/dom';
import { Session } from './session';
import { startLoop } from './loop';
import { wireInput } from './wire-input';
import { exposeDebug } from './debug';
import { makeProjector } from './screen-pos';
import { Sound } from '../audio/sound';
import { GameSounds } from '../audio/game-sounds';
import { focusPoint } from './focus';
import { buildUi, wireSound } from './game-ui';

const AUTOSAVE_MS = 2 * 60 * 1000;

/** Saves every 2 minutes and when the tab is hidden. Returns a stop function. */
function startAutosave(session: Session): () => void {
  const timer = window.setInterval(() => void session.save(), AUTOSAVE_MS);
  const onHide = (): void => {
    if (document.hidden) void session.save();
  };
  document.addEventListener('visibilitychange', onHide);
  return () => {
    window.clearInterval(timer);
    document.removeEventListener('visibilitychange', onHide);
  };
}

/** Shows a loading screen while the renderer starts and the 3D models load. */
async function createViews(
  root: HTMLElement,
  canvas: HTMLCanvasElement,
  state: GameState,
): Promise<ViewManager> {
  const loading = loadingScreen();
  root.replaceChildren(canvas, loading);
  const [renderer] = await Promise.all([createRenderer(canvas), loadKit()]);
  loading.remove();
  return new ViewManager(state, renderer, canvas);
}

/** Connects view changes and planet changes to the session. */
function linkViews(session: Session, views: ViewManager): void {
  views.onChange = (name) => {
    session.ui.view = name;
    session.startPlacing(undefined);
  };
  views.onZone = (zone) => {
    session.ui.zone = zone;
    session.select([]);
  };
  session.goZone = (zone) => views.flyTo(zone, focusPoint(session.state, zone));
}

/** Starts one game: canvas, 3D views, HUD, input, loop and autosave. */
export async function startGame(
  root: HTMLElement,
  state: GameState,
  onQuit: () => void,
): Promise<Session> {
  const session = new Session(state);
  const sound = new Sound();
  const sounds = new GameSounds(sound);
  const canvas = el('canvas', { class: 'game-canvas' });
  const views = await createViews(root, canvas, state);
  linkViews(session, views);
  const project = makeProjector(session, views, canvas);
  const stops: (() => void)[] = [];
  /** Leaving the game: stop the loop, autosave, sound and listeners of this game. */
  const quit = (): void => {
    stops.forEach((stop) => stop());
    onQuit();
  };
  const ui = buildUi(root, session, { views, sound, project, onQuit: quit });
  wireInput(canvas, session, views, project);
  const resize = (): void => views.resize(root.clientWidth, root.clientHeight);
  window.addEventListener('resize', resize);
  resize();
  stops.push(wireSound(root, sound), () => window.removeEventListener('resize', resize));
  const stopLoop = startLoop({
    tickMs: TICK_MS,
    speed: () => session.speed,
    tick: () => tick(session.state),
    frame: (dt) => {
      views.frame(session.state, session.ui, dt);
      ui.frame();
      sounds.update(session.state, session.ui.zone);
    },
    slow: () => ui.update(),
  });
  stops.push(stopLoop, startAutosave(session));
  exposeDebug(session, project, views);
  return session;
}
