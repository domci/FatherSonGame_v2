import type { LobbyDO } from './lobby';
import type { AiRunner } from './moderation';
import type { WorldRoom } from './room';

/** Bindings of the Worker (see wrangler.jsonc). */
export interface Env {
  LOBBY: DurableObjectNamespace<LobbyDO>;
  ROOM: DurableObjectNamespace<WorldRoom>;
  ASSETS: Fetcher;
  /** Workers AI (chat check). Missing in local tests. */
  AI?: AiRunner;
  /** 'ai' (default) or 'rules' (local tests only: no AI check). */
  MODERATION?: string;
  /** Password of the parents' page (reports). Not set = page off. */
  ADMIN_KEY?: string;
  /** Version of the game files (browsers with another version must reload). */
  BUILD?: string;
  /** 'off' only locally: workerd has no EU jurisdiction. */
  EU?: string;
}

function eu<T extends Rpc.DurableObjectBranded | undefined>(
  env: Env,
  ns: DurableObjectNamespace<T>,
): DurableObjectNamespace<T> {
  return env.EU === 'off' ? ns : ns.jurisdiction('eu');
}

/** All data stays in the EU (Durable Object jurisdiction). */
export function lobbyOf(env: Env): DurableObjectStub<LobbyDO> {
  const ns = eu(env, env.LOBBY);
  return ns.get(ns.idFromName('lobby'));
}

export function roomOf(env: Env, worldId: string): DurableObjectStub<WorldRoom> {
  const ns = eu(env, env.ROOM);
  return ns.get(ns.idFromName(worldId));
}
