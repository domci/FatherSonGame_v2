/**
 * Balancing run: the computer plays against itself (dev tool, not part of the game).
 * Usage: bun tools/balance.ts [games=30] [workers=4]
 * Part 1: a stand-in player (computer at full strength, but thinks 3× slower)
 *         against each difficulty, `games` games each.
 * Part 2: `games` games full strength against full strength (humans vs aliens).
 * Writes docs/balance.md.
 */
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { AI_TUNING, type Difficulty } from '../src/content/ai';
import type { Faction } from '../src/content/factions';
import { THINK_MS } from '../src/sim/ai/brain';
import { UNITS } from '../src/content/units';
import { buildingsOf, isFighter, unitsOf } from '../src/sim/ai/queries';
import type { PlayerId } from '../src/sim/entity';
import { createGame } from '../src/sim/game';
import type { GameState } from '../src/sim/state';
import { economyStep, liveStep } from '../src/sim/update';
import { report, type Job, type Result, type Snapshot } from './balance-report';

const STEP_MS = 250;
const MAX_HOURS = 8;
const MINUTE = 60_000;

function snapshot(s: GameState): Record<'player' | 'ai', Snapshot> {
  const of = (id: PlayerId): Snapshot => {
    const units = unitsOf(s, id);
    return {
      buildings: buildingsOf(s, id).length,
      army: units.filter(isFighter).length,
      air: units.filter((u) => u.unit && UNITS[u.unit.type].air).length,
      fleet: s.world.with('orbit').entities.filter((e) => e.owner === id).length,
    };
  };
  return { player: of('player'), ai: of('ai') };
}

function playOne(job: Job): Result {
  const s = createGame({ seed: job.seed, faction: job.faction, time: 0, difficulty: job.ai });
  const first = AI_TUNING.normal.firstAttackMs;
  s.ai.player = { nextThinkAt: 0, nextAttackAt: first, waves: 0, difficulty: 'normal', free: true };
  s.ai.player.thinkMs = job.playerThinkMs;
  if (s.ai.ai) s.ai.ai.free = job.aiFree;
  let at60 = snapshot(s);
  let at120 = at60;
  let firstAttack: number | undefined;
  while (!s.winner && s.time < MAX_HOURS * 60 * MINUTE) {
    economyStep(s, STEP_MS);
    liveStep(s, STEP_MS);
    if (s.time === 60 * MINUTE) at60 = snapshot(s);
    if (s.time === 120 * MINUTE) at120 = snapshot(s);
    if (firstAttack === undefined && (s.ai.ai?.waves ?? 0) > 0) firstAttack = s.time / MINUTE;
  }
  const waves = s.ai.ai?.waves ?? 0;
  const atEnd = snapshot(s);
  return {
    ...job,
    winner: s.winner,
    minutes: s.time / MINUTE,
    waves,
    firstAttack,
    at60,
    at120,
    atEnd,
  };
}

function jobs(games: number): Job[] {
  const out: Job[] = [];
  const faction = (i: number): Faction => (i % 2 === 0 ? 'human' : 'alien');
  const levels: Difficulty[] = ['easy', 'normal', 'hard'];
  for (const ai of levels)
    for (let i = 0; i < games; i++)
      out.push({
        part: 1,
        seed: 1000 + i,
        faction: faction(i),
        ai,
        aiFree: false,
        playerThinkMs: 3 * THINK_MS,
      });
  for (let i = 0; i < games; i++)
    out.push({
      part: 2,
      seed: 5000 + i,
      faction: faction(i),
      ai: 'normal',
      aiFree: true,
      playerThinkMs: THINK_MS,
    });
  return out;
}

/** Worker: plays every n-th job and prints one JSON line per game. */
function worker(index: number, count: number, games: number): void {
  jobs(games).forEach((job, i) => {
    if (i % count === index) console.info(JSON.stringify(playOne(job)));
  });
}

function runWorker(index: number, count: number, games: number): Promise<Result[]> {
  return new Promise((resolve) => {
    const args = [process.argv[1] ?? '', '--worker', String(index), String(count), String(games)];
    const child = spawn(process.execPath, args, { stdio: ['ignore', 'pipe', 'inherit'] });
    let text = '';
    child.stdout.on('data', (d: Buffer) => {
      text += d.toString();
      process.stdout.write('.');
    });
    child.on('close', () =>
      resolve(
        text
          .split('\n')
          .filter((l) => l.startsWith('{'))
          .map((l) => JSON.parse(l) as Result),
      ),
    );
  });
}

async function main(): Promise<void> {
  if (process.argv[2] === '--worker') {
    const [index, count, games] = process.argv.slice(3).map(Number);
    worker(index ?? 0, count ?? 1, games ?? 1);
    return;
  }
  const games = Number(process.argv[2] ?? 30);
  const workers = Number(process.argv[3] ?? 4);
  const started = performance.now();
  const parts = await Promise.all(
    Array.from({ length: workers }, (_, i) => runWorker(i, workers, games)),
  );
  const seconds = (performance.now() - started) / 1000;
  const md = report(parts.flat(), { games, stepMs: STEP_MS, maxHours: MAX_HOURS, seconds });
  writeFileSync('docs/balance.md', md);
  console.info(`\n${md}`);
}

void main();
