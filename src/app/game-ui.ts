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
import { endScreen } from '../ui/end-screen';
import { otherFaction } from '../content/factions';
import type { Sound } from '../audio/sound';
import type { ViewManager } from '../render/view-manager';
import type { Session } from './session';
import type { Projector } from './screen-pos';

function settingRows(session: Session, sound: Sound): HTMLElement[] {
  return [
    toggleRow('Geräusche', 'Laser, Explosionen, Klicks', sound.sfxOn, () => sound.toggleSfx()),
    toggleRow('Musik', 'Ruhige Klänge, Kampfmusik', sound.musicOn, () => sound.toggleMusic()),
    levelPicker(session.state.settings.difficulty, (difficulty) =>
      session.command({ type: 'settings', player: 'player', difficulty }),
    ),
    toggleRow(
      'Angriffe, auch wenn keiner spielt',
      'Aus: Der Feind greift nur an, wenn ihr spielt.',
      session.state.settings.offlineAttacks,
      (on) => session.command({ type: 'settings', player: 'player', offlineAttacks: on }),
    ),
  ];
}

function openMenu(root: HTMLElement, session: Session, sound: Sound, onQuit: () => void): void {
  const menu = pauseMenu({
    resume: () => menu.remove(),
    save: () => void session.save().then(() => session.onMessage('Gespeichert.', 'good')),
    exportFile: () => exportSave(toSaveData(session.state, Date.now())),
    quit: () => void session.save().then(onQuit),
    settings: settingRows(session, sound),
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

/** Shows "victory" or "defeat" once, when the game has a winner. */
function watchEnd(root: HTMLElement, session: Session, onQuit: () => void): () => void {
  let shown = false;
  return () => {
    const winner = session.state.winner;
    if (!winner || shown) return;
    shown = true;
    const faction = session.ui.faction;
    const screen = endScreen(winner === 'player', faction, otherFaction(faction), {
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
}

export interface GameUi {
  /** Every frame (health bars). */
  frame(): void;
  /** A few times per second (panels, end check). */
  update(): void;
}

/** All HTML parts over the 3D view: HUD, build bar, army bar, info panel, toasts, bars. */
export function buildUi(root: HTMLElement, session: Session, d: UiDeps): GameUi {
  const hud = new Hud(session, {
    goView: (n) => d.views.go(n),
    openMenu: () => openMenu(root, session, d.sound, d.onQuit),
    openColony: () => session.openPanel('colony'),
  });
  const parts = [
    hud,
    new BuildMenu(session),
    new ArmyBar(session),
    new InfoPanel(session),
    new Toasts(session),
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
