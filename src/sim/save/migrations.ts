import { newColony } from '../colony';
import { newQuiz } from '../quiz';
import { SAVE_VERSION } from '../state';
import type { SaveData } from './save';

/**
 * One function per old version: turns version N into N+1.
 * Add a new entry whenever SaveData changes, and a test for it.
 */
const MIGRATIONS: Record<number, (old: Record<string, unknown>) => Record<string, unknown>> = {
  // M3: settings and the computer enemy. The enemy base is added after loading (ensureOpponent).
  1: (old) => ({
    ...old,
    settings: { difficulty: 'normal', offlineAttacks: false, opponent: true },
    ai: {},
  }),
  // M5: people in the domes and the knowledge quiz.
  2: (old) => ({ ...old, players: withM5(old.players) }),
};

function withM5(players: unknown): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (!isRecord(players)) return out;
  for (const [id, p] of Object.entries(players))
    out[id] = isRecord(p) ? { colony: newColony(), quiz: newQuiz(), ...p } : p;
  return out;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

export function migrate(raw: unknown): SaveData {
  if (!isRecord(raw) || typeof raw.version !== 'number')
    throw new Error('Kein gültiger Spielstand.');
  let data = raw;
  let version = raw.version;
  if (version > SAVE_VERSION) throw new Error('Spielstand ist von einer neueren Version.');
  while (version < SAVE_VERSION) {
    const step = MIGRATIONS[version];
    if (!step) throw new Error(`Keine Migration von Version ${version}.`);
    data = { ...step(data), version: version + 1 };
    version += 1;
  }
  return data as unknown as SaveData;
}
