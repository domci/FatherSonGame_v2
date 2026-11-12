import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/rajdhani/500.css';
import '@fontsource/rajdhani/600.css';
import '@fontsource/rajdhani/700.css';
import './ui/theme.css';
import './ui/hud.css';
import './ui/menu.css';
import './ui/colony.css';
import './ui/peoples.css';
import { createGame } from './sim/game';
import { randomSeed } from './sim/rng';
import { fromSaveData, type SaveData } from './sim/save/save';
import { catchUp } from './sim/update';
import type { GameState } from './sim/state';
import { loadSave, importSaveFile } from './platform/storage';
import { startGame } from './app/game-app';
import { mainMenu } from './ui/main-menu';
import { newGameDialog, type NewGameChoice } from './ui/new-game';
import { awayReport } from './ui/away-report';
import { el } from './ui/dom';
import { storyIntro } from './ui/story';

const MIN_AWAY_MS = 60_000;

function root(): HTMLElement {
  const r = document.getElementById('app');
  if (!r) throw new Error('#app missing');
  return r;
}

async function play(state: GameState): Promise<void> {
  await startGame(root(), state, () => void showMenu());
}

async function resume(raw: unknown): Promise<void> {
  const state = fromSaveData(raw);
  const savedAt = (raw as Partial<SaveData>).savedAt ?? Date.now();
  const report = catchUp(state, Date.now() - savedAt);
  await play(state);
  if (report.elapsedMs > MIN_AWAY_MS)
    root().append(awayReport(report, state.events, () => undefined));
}

function showError(e: unknown): void {
  const text = e instanceof Error ? e.message : String(e);
  root().append(el('div', { class: 'toasts' }, el('div', { class: 'toast bad' }, text)));
}

function startNew(c: NewGameChoice): void {
  const state = createGame({ seed: randomSeed(), time: 0, ...c });
  void play(state)
    .then(() => root().append(storyIntro(c.faction, () => undefined)))
    .catch(showError);
}

async function showMenu(): Promise<void> {
  const saved = await loadSave();
  root().replaceChildren(
    mainMenu({
      newGame: () => {
        const dialog = newGameDialog(startNew, () => dialog.remove());
        root().append(dialog);
      },
      continueGame: saved ? () => void resume(saved).catch(showError) : undefined,
      importGame: () => void importSaveFile().then(resume).catch(showError),
    }),
  );
}

void showMenu();
