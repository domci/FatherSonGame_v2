import type { Difficulty } from '../src/content/ai';
import type { Faction } from '../src/content/factions';
import type { PlayerId } from '../src/sim/entity';

export interface Snapshot {
  buildings: number;
  army: number;
}

export interface Job {
  part: 1 | 2;
  seed: number;
  /** People of the side on the home planet ('player'). */
  faction: Faction;
  player: Difficulty;
  ai: Difficulty;
}

export interface Result extends Job {
  winner?: PlayerId;
  minutes: number;
  waves: number;
  at60: Record<'player' | 'ai', Snapshot>;
  at120: Record<'player' | 'ai', Snapshot>;
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

const humanSide = (r: Result): 'player' | 'ai' => (r.faction === 'human' ? 'player' : 'ai');
const alienSide = (r: Result): 'player' | 'ai' => (r.faction === 'human' ? 'ai' : 'player');

function strength(
  rs: Result[],
  at: 'at60' | 'at120',
  side: (r: Result) => 'player' | 'ai',
): string {
  const b = avg(rs.map((r) => r[at][side(r)].buildings)).toFixed(1);
  const a = avg(rs.map((r) => r[at][side(r)].army)).toFixed(1);
  return `${b} Gebäude, ${a} Kämpfer`;
}

function lengthRows(done: Result[]): string {
  const lengths = done.map((r) => r.minutes);
  if (!lengths.length) return '| Spieldauer | – |';
  return [
    `| Spieldauer Median | ${median(lengths).toFixed(0)} min |`,
    `| Spieldauer kürzeste / längste | ${Math.min(...lengths).toFixed(0)} / ${Math.max(...lengths).toFixed(0)} min |`,
  ].join('\n');
}

function part1(rs: Result[]): string {
  const done = rs.filter((r) => r.winner);
  const humanWins = done.filter((r) => r.winner === humanSide(r)).length;
  const homeWins = done.filter((r) => r.winner === 'player').length;
  return `## Teil 1: Normal gegen Normal (${rs.length} Partien)

| Wert | Zahl |
| --- | --- |
| mit Sieger | ${done.length} (${pct(done.length, rs.length)}) |
| Siege Menschen | ${humanWins} (${pct(humanWins, done.length)}) |
| Siege Aliens | ${done.length - humanWins} (${pct(done.length - humanWins, done.length)}) |
| Siege Heimatplanet (mit Spinnen) | ${homeWins} (${pct(homeWins, done.length)}) |
${lengthRows(done)}
| Angriffswellen pro Partie (beide Seiten) | ${avg(rs.map((r) => r.waves)).toFixed(1)} |

| Zeit | Menschen | Aliens |
| --- | --- | --- |
| 60 min | ${strength(rs, 'at60', humanSide)} | ${strength(rs, 'at60', alienSide)} |
| 120 min | ${strength(rs, 'at120', humanSide)} | ${strength(rs, 'at120', alienSide)} |
`;
}

function part2(rs: Result[]): string {
  const done = rs.filter((r) => r.winner);
  const hardWins = done.filter((r) => r.winner === 'player').length;
  return `## Teil 2: Schwer gegen Leicht (${rs.length} Partien)

| Wert | Zahl |
| --- | --- |
| mit Sieger | ${done.length} (${pct(done.length, rs.length)}) |
| Siege „Schwer“ | ${hardWins} (${pct(hardWins, done.length)}) |
${lengthRows(done)}
`;
}

/** Markdown report for docs/balance.md. */
export function report(all: Result[], info: RunInfo): string {
  return `# Balancing: Computer gegen Computer

Erzeugt mit \`bun tools/balance.ts ${info.games}\` (${Math.round(info.seconds)} s Rechenzeit).
Beide Seiten spielen mit der Computer-KI. Halbe Partien: Menschen auf dem Heimatplaneten
(mit Spinnen-Nestern), halbe Partien: Aliens dort.
Schritt: ${info.stepMs} ms. Höchstens ${info.maxHours} Stunden Spielzeit pro Partie (sonst: unentschieden).

${part1(all.filter((r) => r.part === 1))}
${part2(all.filter((r) => r.part === 2))}`;
}
