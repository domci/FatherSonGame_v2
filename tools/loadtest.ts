// Load test for the online game (ADR 0012): many accounts, worlds and players at once.
// Start the local server first (`bun run server`), then:
//   bun tools/loadtest.ts [worlds=25] [playersPerWorld=4] [seconds=60] [base=http://localhost:8787]
// Never run it against the live game: it makes real accounts and worlds there.
import { makeName } from '../src/net/names';
import type { ServerMessage } from '../src/net/protocol';

const [WORLDS = 25, PER_WORLD = 4, SECONDS = 60] = process.argv.slice(2, 5).map(Number);
const BASE = process.argv[5] ?? 'http://localhost:8787';

interface Account {
  id: string;
  key: string;
}

interface Stats {
  steps: number;
  pongs: number[];
  chats: number;
  errors: number;
  snapshots: number;
}

const stats: Stats = { steps: 0, pongs: [], chats: 0, errors: 0, snapshots: 0 };

async function call<T>(path: string, init: RequestInit, a?: Account): Promise<T> {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (a) Object.assign(headers, { 'x-account': a.id, 'x-key': a.key });
  const res = await fetch(BASE + path, { ...init, headers });
  if (!res.ok) throw new Error(`${path}: ${res.status} ${await res.text()}`);
  return (await res.json()) as T;
}

const newAccount = (): Promise<Account> =>
  call('/api/account', { method: 'POST', body: JSON.stringify({ name: makeName(Math.random) }) });

async function newWorld(owner: Account, i: number): Promise<string> {
  const body = { name: `Last ${i}`, difficulty: 'easy', computers: 0, people: 4, open: true };
  const w = await call<{ id: string }>(
    '/api/worlds',
    { method: 'POST', body: JSON.stringify({ ...body, faction: 'human' }) },
    owner,
  );
  return w.id;
}

function onMessage(text: string, sentPing: { at: number }): void {
  const msg = JSON.parse(text) as ServerMessage;
  if (msg.t === 'steps') stats.steps++;
  else if (msg.t === 'snapshot') stats.snapshots++;
  else if (msg.t === 'chat') stats.chats++;
  else if (msg.t === 'error') stats.errors++;
  else if (msg.t === 'pong') stats.pongs.push(performance.now() - sentPing.at);
}

/** One player: joins, pings every 2 s and sends a ready-made message every 10 s. */
function play(worldId: string, a: Account, until: number): Promise<void> {
  return new Promise((done) => {
    const ws = new WebSocket(`${BASE.replace(/^http/, 'ws')}/ws/${worldId}`);
    const ping = { at: 0 };
    let n = 0;
    const timer = setInterval(() => {
      if (performance.now() > until) return ws.close();
      ping.at = performance.now();
      ws.send(JSON.stringify({ t: 'ping' }));
      if (++n % 5 === 0) ws.send(JSON.stringify({ t: 'chat', to: { kind: 'world' }, quick: 0 }));
    }, 2000);
    ws.onopen = () =>
      ws.send(JSON.stringify({ t: 'hello', account: a.id, key: a.key, build: 'load' }));
    ws.onmessage = (e) => onMessage(String(e.data), ping);
    ws.onerror = () => stats.errors++;
    ws.onclose = () => {
      clearInterval(timer);
      done();
    };
  });
}

function percentile(list: number[], p: number): number {
  const sorted = [...list].sort((x, y) => x - y);
  return Math.round(sorted[Math.floor((sorted.length - 1) * p)] ?? 0);
}

async function lobbyTime(a: Account): Promise<number> {
  const t0 = performance.now();
  await call('/api/worlds', { method: 'GET' }, a);
  return Math.round(performance.now() - t0);
}

async function main(): Promise<void> {
  const t0 = performance.now();
  const accounts = await Promise.all(
    Array.from({ length: WORLDS * PER_WORLD }, () => newAccount()),
  );
  const owners = accounts.filter((_, i) => i % PER_WORLD === 0);
  const worlds = await Promise.all(owners.map((o, i) => newWorld(o, i)));
  const setup = Math.round(performance.now() - t0);
  const until = performance.now() + SECONDS * 1000;
  const lobby = await Promise.all(accounts.slice(0, 50).map(lobbyTime));
  await Promise.all(
    accounts.map((a, i) => play(worlds[Math.floor(i / PER_WORLD)] ?? '', a, until)),
  );
  const players = accounts.length;
  const expected = (players * SECONDS * 1000) / 200;
  console.info(
    JSON.stringify(
      {
        players,
        worlds: worlds.length,
        setupMs: setup,
        lobbyMs: { p50: percentile(lobby, 0.5), p95: percentile(lobby, 0.95) },
        pingMs: { p50: percentile(stats.pongs, 0.5), p95: percentile(stats.pongs, 0.95) },
        stepMessages: stats.steps,
        stepShare: Math.round((stats.steps / expected) * 100) / 100,
        chats: stats.chats,
        snapshots: stats.snapshots,
        errors: stats.errors,
      },
      null,
      2,
    ),
  );
}

void main();
