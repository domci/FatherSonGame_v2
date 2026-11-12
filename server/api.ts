import type { NewWorld } from '../src/net/protocol';
import { lobbyOf, roomOf, type Env } from './env';
import { publicInfo, type AccountRecord } from './lobby-core';

const DIFFICULTIES = ['easy', 'normal', 'hard'];

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}

async function body<T>(req: Request): Promise<T | undefined> {
  try {
    return (await req.json()) as T;
  } catch {
    return undefined;
  }
}

/** The account of the request (headers X-Account and X-Key). */
async function account(req: Request, env: Env): Promise<AccountRecord | undefined> {
  const id = req.headers.get('x-account');
  const key = req.headers.get('x-key');
  if (!id || !key) return undefined;
  const a = await lobbyOf(env).verify(id, key);
  return a && !a.banned ? a : undefined;
}

/** A sensible new world: 2..4 sides, at least one place for people. */
export function goodWorld(w: NewWorld | undefined): w is NewWorld {
  if (!w || typeof w.name !== 'string' || !DIFFICULTIES.includes(w.difficulty)) return false;
  const { computers, people } = w;
  if (!Number.isInteger(computers) || !Number.isInteger(people)) return false;
  return computers >= 0 && people >= 1 && computers + people >= 2 && computers + people <= 4;
}

async function createWorld(req: Request, env: Env, a: AccountRecord): Promise<Response> {
  const w = await body<NewWorld>(req);
  if (!goodWorld(w)) return json({ error: 'Diese Welt geht so nicht.' }, 400);
  const record = await lobbyOf(env).createWorld(a, w);
  const faction = w.faction === 'alien' ? 'alien' : 'human';
  await roomOf(env, record.id).init(record, { account: a.id, name: a.name, faction });
  return json(publicInfo(record, 'player'));
}

async function deleteMe(env: Env, a: AccountRecord): Promise<Response> {
  const worlds = await lobbyOf(env).deleteAccount(a);
  for (const id of worlds) await roomOf(env, id).removeAccount(a.id);
  return json({ ok: true });
}

/** Your account: read, new name, delete. */
async function me(req: Request, env: Env, a: AccountRecord): Promise<Response> {
  if (req.method === 'GET')
    return json({ id: a.id, name: a.name, chatBanUntil: a.chatBanUntil, strikes: a.strikes });
  if (req.method === 'DELETE') return deleteMe(env, a);
  const b = await body<{ name?: string }>(req);
  return (await lobbyOf(env).rename(a, String(b?.name)))
    ? json({ ok: true })
    : json({ error: 'Name geht nicht.' }, 400);
}

async function byCode(env: Env, code: string, a: AccountRecord): Promise<Response> {
  const w = await lobbyOf(env).byCode(code);
  return w
    ? json(publicInfo(w, a.worlds[w.id]))
    : json({ error: 'Keine Welt mit diesem Code.' }, 404);
}

async function withAccount(
  req: Request,
  env: Env,
  path: string,
  a: AccountRecord,
): Promise<Response> {
  if (path === '/api/me') return me(req, env, a);
  if (path === '/api/worlds' && req.method === 'GET') return json(await lobbyOf(env).listWorlds(a));
  if (path === '/api/worlds' && req.method === 'POST') return createWorld(req, env, a);
  const code = /^\/api\/worlds\/([0-9A-Za-z]{6})$/.exec(path)?.[1];
  if (code && req.method === 'GET') return byCode(env, code, a);
  return json({ error: 'Gibt es nicht.' }, 404);
}

/** Parents' page: reports (needs the ADMIN_KEY password). */
async function admin(req: Request, env: Env): Promise<Response> {
  if (!env.ADMIN_KEY || req.headers.get('x-admin-key') !== env.ADMIN_KEY)
    return json({ error: 'Kein Zugang.' }, 403);
  if (req.method === 'GET') return json(await lobbyOf(env).reports());
  const b = await body<{ id?: string; action?: string }>(req);
  const action = b?.action === 'strike' || b?.action === 'ban' ? b.action : 'dismiss';
  await lobbyOf(env).resolve(String(b?.id), action);
  return json({ ok: true });
}

export async function handleApi(req: Request, env: Env, path: string): Promise<Response> {
  if (path === '/api/account' && req.method === 'POST') {
    const b = await body<{ name?: string }>(req);
    const made = await lobbyOf(env).createAccount(String(b?.name));
    return made ? json(made) : json({ error: 'Name geht nicht.' }, 400);
  }
  if (path === '/api/admin/reports') return admin(req, env);
  const a = await account(req, env);
  if (!a) return json({ error: 'Bitte neu anmelden.' }, 401);
  return withAccount(req, env, path, a);
}
