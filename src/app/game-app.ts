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
import { buildUi, wireSound, type GameUi } from './game-ui';
import type { OnlineGame } from '../online/online-game';

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

export interface GameOptions {
  /** Back to the menu (online: to the lobby, with the reason if the server said no). */
  onQuit: (problem?: Error) => void;
  /** An online world (M7): the server runs the game, this browser replays it. */
  online?: OnlineGame;
}

/** Online: fresh states, server messages and problems reach the game screen. */
function linkOnline(session: Session, online: OnlineGame, quit: (e?: Error) => void): void {
  online.onState = (state) => (session.state = state);
  online.onNotice = (text, kind) => session.onMessage(text, kind);
  online.onError = (e) => quit(e);
}

interface LoopParts {
  session: Session;
  views: ViewManager;
  ui: GameUi;
  sounds: GameSounds;
  online?: OnlineGame;
}

/** Game steps (local, or replayed from the server) and drawing. Returns a stop function. */
function runLoop(p: LoopParts): () => void {
  const { session, views, ui, sounds, online } = p;
  return startLoop({
    tickMs: TICK_MS,
    speed: () => (online ? 1 : session.speed),
    tick: online ? () => online.step() : () => tick(session.state),
    frame: (dt) => {
      views.frame(session.state, session.ui, dt);
      ui.frame();
      sounds.update(session.state, session.ui.zone);
    },
    slow: () => ui.update(),
  });
}

/** Starts one game: canvas, 3D views, HUD, input, loop and autosave. */
export async function startGame(
  root: HTMLElement,
  state: GameState,
  opts: GameOptions,
): Promise<Session> {
  const online = opts.online;
  const session = new Session(state, online);
  const sound = new Sound();
  const sounds = new GameSounds(sound);
  const canvas = el('canvas', { class: 'game-canvas' });
  const views = await createViews(root, canvas, state);
  linkViews(session, views);
  const project = makeProjector(session, views, canvas);
  const stops: (() => void)[] = [];
  /** Leaving the game: stop the loop, autosave, sound, connection and listeners. */
  const quit = (problem?: Error): void => {
    online?.leave();
    stops.forEach((stop) => stop());
    opts.onQuit(problem);
  };
  const ui = buildUi(root, session, { views, sound, project, onQuit: quit, online });
  if (online) linkOnline(session, online, quit);
  wireInput(canvas, session, views, project);
  const resize = (): void => views.resize(root.clientWidth, root.clientHeight);
  window.addEventListener('resize', resize);
  resize();
  stops.push(wireSound(root, sound), () => window.removeEventListener('resize', resize));
  stops.push(runLoop({ session, views, ui, sounds, online }));
  if (!online) stops.push(startAutosave(session));
  exposeDebug(session, project, views);
  return session;
}
