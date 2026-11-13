import { viewerOf } from '../sim/viewer';
import { toSaveData } from '../sim/save/save';
import { exportSave } from '../platform/storage';
import { Hud } from '../ui/hud';
import { BuildMenu } from '../ui/build-menu';
import { InfoPanel } from '../ui/info-panel';
import { Toasts } from '../ui/toasts';
import { pauseMenu } from '../ui/main-menu';
import { Bars } from '../ui/bars';
import { ArmyBar } from '../ui/army-bar';
import { levelPicker, toggleRow } from '../ui/menu-kit';
import { endScreen, endText } from '../ui/end-screen';
import { openQuiz } from '../ui/quiz';
import { MissionCard } from '../ui/mission-card';
import type { Sound } from '../audio/sound';
import type { ViewManager } from '../render/view-manager';
import type { Session } from './session';
import type { Projector } from './screen-pos';
import type { OnlineGame } from '../online/online-game';
import { ChatPanel } from '../ui/chat-panel';
import { onlineDefeatScreen } from '../ui/end-screen';

/** Sound for everybody; game options only for the maker of the world ('player'). */
function settingRows(session: Session, sound: Sound): HTMLElement[] {
  const rows = [
    toggleRow('Geräusche', 'Laser, Explosionen, Klicks', sound.sfxOn, () => sound.toggleSfx()),
    toggleRow('Musik', 'Ruhige Klänge, Kampfmusik', sound.musicOn, () => sound.toggleMusic()),
  ];
  if (session.me !== 'player') return rows;
  return [
    ...rows,
    levelPicker(session.state.settings.difficulty, (difficulty) =>
      session.command({ type: 'settings', player: session.me, difficulty }),
    ),
    toggleRow(
      'Angriffe, auch wenn keiner spielt',
      'Aus: Die Gegner greifen nur an, wenn ihr spielt.',
      session.state.settings.offlineAttacks,
      (on) => session.command({ type: 'settings', player: session.me, offlineAttacks: on }),
    ),
  ];
}

function openMenu(root: HTMLElement, session: Session, sound: Sound, onQuit: () => void): void {
  const settings = settingRows(session, sound);
  const menu = session.net
    ? pauseMenu({ resume: () => menu.remove(), quit: onQuit, quitLabel: 'Zur Lobby', settings })
    : pauseMenu({
        resume: () => menu.remove(),
        save: () => void session.save().then(() => session.onMessage('Gespeichert.', 'good')),
        exportFile: () => exportSave(toSaveData(session.state, Date.now())),
        quit: () => void session.save().then(onQuit),
        settings,
      });
  root.append(menu);
}

/**
 * Sound starts with the first tap (browser rule); every button click makes a small sound.
 * Returns a function that removes the listeners and stops all sound.
 */
export function wireSound(root: HTMLElement, sound: Sound): () => void {
  const unlock = (): void => sound.unlock();
  const click = (e: Event): void => {
    if ((e.target as HTMLElement).closest('button')) sound.play('ui', { volume: 0.3 });
  };
  window.addEventListener('pointerdown', unlock);
  window.addEventListener('keydown', unlock);
  root.addEventListener('click', click);
  return () => {
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
    root.removeEventListener('click', click);
    sound.stop();
  };
}

/** Online: "beaten" with "start again"; it goes away after the new start. */
function watchDefeat(root: HTMLElement, session: Session, onQuit: () => void): () => void {
  let screen: HTMLElement | undefined;
  return () => {
    const beaten = session.state.players[session.me]?.defeated === true;
    if (beaten && !screen) {
      screen = onlineDefeatScreen(session.state, {
        restart: () => session.command({ type: 'restart', player: session.me }),
        lobby: onQuit,
      });
      root.append(screen);
    } else if (!beaten && screen) {
      screen.remove();
      screen = undefined;
    }
  };
}

/** Shows "victory" or "defeat" once, when the game has a winner. */
function watchEnd(root: HTMLElement, session: Session, onQuit: () => void): () => void {
  if (session.net) return watchDefeat(root, session, onQuit);
  let shown = false;
  return () => {
    const winner = session.state.winner;
    if (!winner || shown) return;
    shown = true;
    const screen = endScreen(winner === viewerOf(session.state), endText(session.state), {
      menu: () => void session.save().then(onQuit),
      watch: () => screen.remove(),
    });
    root.append(screen);
  };
}

export interface UiDeps {
  views: ViewManager;
  sound: Sound;
  project: Projector;
  onQuit: () => void;
  online?: OnlineGame;
}

export interface GameUi {
  /** Every frame (health bars). */
  frame(): void;
  /** A few times per second (panels, end check). */
  update(): void;
}

/** All HTML parts over the 3D view: HUD, build bar, army bar, info panel, toasts, bars. */
export function buildUi(root: HTMLElement, session: Session, d: UiDeps): GameUi {
  const chat = d.online && new ChatPanel(d.online);
  const hud = new Hud(session, {
    extraButtons: chat ? [chat.button] : [],
    goView: (n) => d.views.go(n),
    openMenu: () => openMenu(root, session, d.sound, d.onQuit),
    openColony: () => session.openPanel('colony'),
    openQuiz: () => openQuiz(root, session),
    openPeoples: () => session.openPanel('peoples'),
  });
  const parts = [
    hud,
    new BuildMenu(session),
    new ArmyBar(session),
    new InfoPanel(session),
    new MissionCard(session),
    new Toasts(session),
    ...(chat ? [chat] : []),
  ];
  const bars = new Bars(d.project);
  root.append(bars.root, ...parts.map((p) => p.root));
  const checkEnd = watchEnd(root, session, d.onQuit);
  return {
    frame: () => bars.update(session.state, session.ui.selectedIds),
    update: () => {
      parts.forEach((p) => p.update());
      checkEnd();
    },
  };
}
