import { CHAT_GAP_MS } from '../src/content/chat';
import type {
  ChatLine,
  ChatTo,
  ClientMessage,
  ErrorCode,
  ServerMessage,
} from '../src/net/protocol';
import { isSide } from '../src/sim/relations';
import type { LobbyDO } from './lobby';
import { publicInfo, type AccountRecord, type WorldRecord } from './lobby-core';
import { canRead, type RoomChat } from './room-chat';
import type { Peer, RoomCore } from './room-core';

/** What the message handlers need from the world room. */
export interface RoomContext {
  core?: RoomCore;
  info?: WorldRecord;
  readonly chat: RoomChat;
  /** Accounts of the connected browsers (after "hello"). */
  readonly accounts: Map<Peer, AccountRecord>;
  readonly lastChat: Map<Peer, number>;
  readonly build: string | undefined;
  lobby(): DurableObjectStub<LobbyDO>;
  send(peer: Peer, msg: ServerMessage): void;
  startTimers(): void;
  persist(): Promise<void>;
}

function fail(ctx: RoomContext, peer: Peer, code: ErrorCode, text: string): void {
  ctx.send(peer, { t: 'error', code, text });
  peer.close(4000 + ['reload', 'auth', 'full', 'banned', 'gone'].indexOf(code), text);
}

async function hello(
  ctx: RoomContext,
  peer: Peer,
  msg: Extract<ClientMessage, { t: 'hello' }>,
): Promise<void> {
  const { core, info } = ctx;
  if (!core || !info) return fail(ctx, peer, 'gone', 'Diese Welt gibt es nicht mehr.');
  if (ctx.build && msg.build !== ctx.build)
    return fail(ctx, peer, 'reload', 'Es gibt eine neue Version. Bitte neu laden.');
  const a = await ctx.lobby().verify(String(msg.account), String(msg.key));
  if (!a) return fail(ctx, peer, 'auth', 'Dieses Konto gibt es nicht.');
  if (a.banned) return fail(ctx, peer, 'banned', 'Du darfst nicht mehr online spielen.');
  const before = core.seats[a.id];
  const faction = msg.faction === 'alien' ? 'alien' : 'human';
  const err = core.connect(peer, { account: a.id, name: a.name, faction }, (side) => ({
    t: 'welcome',
    side,
    chat: core.state ? ctx.chat.lines.filter((l) => canRead(core.state, side, l)) : [],
    world: publicInfo(info, side),
  }));
  if (err) return fail(ctx, peer, err, 'In dieser Welt ist kein Platz mehr frei.');
  ctx.accounts.set(peer, a);
  info.lastActive = Date.now();
  ctx.startTimers();
  const side = core.seats[a.id];
  if (!before && side) {
    await ctx.lobby().setSeat(a.id, info.id, side);
    await ctx.persist();
  }
}

function validTo(to: unknown): to is ChatTo {
  const t = to as ChatTo | undefined;
  if (t?.kind === 'world' || t?.kind === 'allies') return true;
  return t?.kind === 'side' && isSide(t.side);
}

function deliver(ctx: RoomContext, line: ChatLine): void {
  const core = ctx.core;
  if (!core) return;
  for (const [p, m] of core.members)
    if (canRead(core.state, m.side, line)) ctx.send(p, { t: 'chat', line });
}

async function chat(
  ctx: RoomContext,
  peer: Peer,
  account: AccountRecord,
  msg: Extract<ClientMessage, { t: 'chat' }>,
): Promise<void> {
  const m = ctx.core?.members.get(peer);
  if (!m || !validTo(msg.to)) return;
  const now = Date.now();
  if (now - (ctx.lastChat.get(peer) ?? 0) < CHAT_GAP_MS)
    return ctx.send(peer, { t: 'notice', text: 'Nicht so schnell.', kind: 'bad' });
  ctx.lastChat.set(peer, now);
  const quick = Number.isInteger(msg.quick) ? msg.quick : undefined;
  const text = typeof msg.text === 'string' ? msg.text : undefined;
  const sender = { side: m.side, name: m.name, chatBanUntil: account.chatBanUntil };
  const r = await ctx.chat.post(sender, msg.to, { text, quick });
  if (r.ok) return deliver(ctx, r.line);
  ctx.send(peer, { t: 'notice', text: r.text, kind: 'bad' });
  if (!r.strike) return;
  const s = await ctx.lobby().strike(account.id);
  account.chatBanUntil = s.chatBanUntil;
  account.banned = s.banned;
  if (s.text) ctx.send(peer, { t: 'notice', text: s.text, kind: 'bad' });
  if (s.banned) fail(ctx, peer, 'banned', s.text);
}

async function report(
  ctx: RoomContext,
  peer: Peer,
  account: AccountRecord,
  id: string,
): Promise<void> {
  const line = ctx.chat.find(String(id));
  const seats = Object.entries(ctx.core?.seats ?? {});
  const offender = seats.find(([, side]) => side === line?.from)?.[0];
  if (!line || !offender || offender === account.id || !ctx.info) return;
  await ctx.lobby().report({
    world: ctx.info.id,
    reporter: account.id,
    offender,
    name: line.name,
    text: line.text,
  });
  ctx.send(peer, { t: 'notice', text: 'Danke! Deine Meldung ist angekommen.', kind: 'info' });
}

/** One message from a browser. Before "hello" only "hello" and "ping" count. */
export async function handleMessage(ctx: RoomContext, peer: Peer, text: string): Promise<void> {
  let msg: ClientMessage;
  try {
    msg = JSON.parse(text) as ClientMessage;
  } catch {
    return;
  }
  if (msg?.t === 'hello') return hello(ctx, peer, msg);
  if (msg?.t === 'ping') return ctx.send(peer, { t: 'pong' });
  const account = ctx.accounts.get(peer);
  if (!account || !ctx.core) return;
  if (msg.t === 'cmd') ctx.core.command(peer, msg.cmd);
  else if (msg.t === 'resync') ctx.core.resync();
  else if (msg.t === 'chat') await chat(ctx, peer, account, msg);
  else if (msg.t === 'report') await report(ctx, peer, account, msg.id);
}
