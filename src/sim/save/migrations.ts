import { SIDE_COLORS } from '../../content/sides';
import { newColony } from '../colony';
import { AI_IDS, type SideId } from '../entity';
import { sideName } from '../setup';
import { newQuiz } from '../quiz';
import { newMission } from '../systems/mission';
import { SAVE_VERSION, type MissionState } from '../state';
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
  // M5: people in the domes, the knowledge quiz and the first mission.
  2: (old) => ({ ...old, players: withM5(old.players) }),
  // M6: many peoples. Old games have one computer side; everybody is at war.
  3: (old) => ({
    ...old,
    settings: withOpponents(old.settings),
    players: withNames(old.players),
    relations: {},
    offers: [],
  }),
};

function withOpponents(settings: unknown): Record<string, unknown> {
  const s = isRecord(settings) ? settings : {};
  return { ...s, opponents: s.opponent === false ? 0 : 1 };
}

function withNames(players: unknown): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (!isRecord(players)) return out;
  for (const [id, p] of Object.entries(players)) {
    if (!isRecord(p) || !isSideId(id)) out[id] = p;
    else
      out[id] = {
        name: sideName(id, p.faction === 'human' ? 'human' : 'alien'),
        color: SIDE_COLORS[id],
        ...p,
      };
  }
  return out;
}

function isSideId(id: string): id is SideId {
  return id === 'player' || (AI_IDS as readonly string[]).includes(id);
}

function withM5(players: unknown): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (!isRecord(players)) return out;
  for (const [id, p] of Object.entries(players))
    out[id] = isRecord(p)
      ? { colony: newColony(), quiz: newQuiz(), mission: oldMission(), ...p }
      : p;
  return out;
}

/** Old games are already running: the first mission is for new games only. */
function oldMission(): MissionState {
  return { ...newMission(), off: true };
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
