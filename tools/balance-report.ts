import { DIFFICULTY_NAMES, type Difficulty } from '../src/content/ai';
import type { Faction } from '../src/content/factions';
import type { PlayerId } from '../src/sim/entity';

export interface Snapshot {
  buildings: number;
  army: number;
  /** Fighters and bombers. */
  air: number;
  /** War ships in space. */
  fleet: number;
}

export interface Job {
  part: 1 | 2;
  seed: number;
  /** People of the side on the home planet ('player'). */
  faction: Faction;
  /** Difficulty of the computer enemy. */
  ai: Difficulty;
  /** true = the enemy plays at full strength (no level matching). */
  aiFree: boolean;
  /** How often the stand-in player thinks (ms). */
  playerThinkMs: number;
}

export interface Result extends Job {
  winner?: PlayerId;
  minutes: number;
  /** Attack waves of the computer enemy. */
  waves: number;
  /** Game minute of the enemy's first attack. */
  firstAttack?: number;
  at60: Record<'player' | 'ai', Snapshot>;
  at120: Record<'player' | 'ai', Snapshot>;
  atEnd: Record<'player' | 'ai', Snapshot>;
}

export interface RunInfo {
  games: number;
  stepMs: number;
  maxHours: number;
  seconds: number;
}

const pct = (n: number, all: number): string => `${Math.round((n / Math.max(1, all)) * 100)} %`;
const avg = (xs: number[]): number => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)] ?? 0;
}

function minutes(xs: number[]): string {
  return xs.length ? `${median(xs).toFixed(0)} min` : '–';
}

function levelRow(level: Difficulty, rs: Result[]): string {
  const player = rs.filter((r) => r.winner === 'player').length;
  const ai = rs.filter((r) => r.winner === 'ai').length;
  const attacked = rs.flatMap((r) => (r.firstAttack === undefined ? [] : [r.firstAttack]));
  return `| ${DIFFICULTY_NAMES[level]} | ${pct(player, rs.length)} | ${pct(ai, rs.length)} | ${pct(rs.length - player - ai, rs.length)} | ${minutes(attacked)} | ${pct(attacked.length, rs.length)} | ${avg(rs.map((r) => r.waves)).toFixed(1)} |`;
}

function part1(rs: Result[]): string {
  const levels: Difficulty[] = ['easy', 'normal', 'hard'];
  return `## Teil 1: Spieler gegen Computer (${rs.length / 3} Partien pro Stufe)

Der „Spieler“ ist ein Computer mit voller Stärke, der aber nur alle 15 s handelt (3× langsamer).

| Stufe | Siege Spieler | Siege Computer | unentschieden | erster Angriff (Median) | Partien mit Angriff | Angriffe pro Partie |
| --- | --- | --- | --- | --- | --- | --- |
${levels
  .map((l) =>
    levelRow(
      l,
      rs.filter((r) => r.ai === l),
    ),
  )
  .join('\n')}
`;
}

/** Median over both sides: "at 120 min / at the end". */
function both(rs: Result[], key: 'air' | 'fleet'): string {
  const of = (snap: (r: Result) => Record<'player' | 'ai', Snapshot>): number =>
    median(rs.flatMap((r) => [snap(r).player[key], snap(r).ai[key]]));
  return `${of((r) => r.at120)} / ${of((r) => r.atEnd)}`;
}

const humanSide = (r: Result): 'player' | 'ai' => (r.faction === 'human' ? 'player' : 'ai');

function part2(rs: Result[]): string {
  const done = rs.filter((r) => r.winner);
  const humanWins = done.filter((r) => r.winner === humanSide(r)).length;
  return `## Teil 2: Menschen gegen Aliens (${rs.length} Partien, beide volle Stärke)

| Wert | Zahl |
| --- | --- |
| mit Sieger | ${done.length} (${pct(done.length, rs.length)}) |
| Siege Menschen | ${humanWins} (${pct(humanWins, done.length)}) |
| Siege Aliens | ${done.length - humanWins} (${pct(done.length - humanWins, done.length)}) |
| Spieldauer Median | ${minutes(done.map((r) => r.minutes))} |
| Flieger pro Seite (Median: 120 min / Ende) | ${both(rs, 'air')} |
| Kampfschiffe pro Seite (Median: 120 min / Ende) | ${both(rs, 'fleet')} |
`;
}

/** Markdown report for docs/balance.md. */
export function report(all: Result[], info: RunInfo): string {
  return `# Balancing: Computer gegen Computer

Erzeugt mit \`bun tools/balance.ts ${info.games}\` (${Math.round(info.seconds)} s Rechenzeit).
Halbe Partien: Menschen auf dem Heimatplaneten (mit Spinnen-Nestern), halbe Partien: Aliens dort.
Schritt: ${info.stepMs} ms. Höchstens ${info.maxHours} Stunden Spielzeit pro Partie (sonst: unentschieden).

${part1(all.filter((r) => r.part === 1))}
${part2(all.filter((r) => r.part === 2))}`;
}
