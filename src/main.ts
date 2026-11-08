import './ui/styles.css';
import './ui/hud.css';
import './ui/menu.css';
import { createGame } from './sim/game';
import { randomSeed } from './sim/rng';
import { fromSaveData, type SaveData } from './sim/save/save';
import { catchUp } from './sim/update';
import type { GameState } from './sim/state';
import { loadSave, importSaveFile } from './platform/storage';
import { startGame } from './app/game-app';
import { mainMenu } from './ui/main-menu';
import { awayReport } from './ui/away-report';
import { el } from './ui/dom';

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

async function showMenu(): Promise<void> {
  const saved = await loadSave();
  root().replaceChildren(
    mainMenu({
      newGame: () =>
        void play(createGame({ seed: randomSeed(), faction: 'human', time: 0 })).catch(showError),
      continueGame: saved ? () => void resume(saved).catch(showError) : undefined,
      importGame: () => void importSaveFile().then(resume).catch(showError),
    }),
  );
}

void showMenu();
