import { DurableObject } from 'cloudflare:workers';
import type { ChatLine, ServerMessage } from '../src/net/protocol';
import type { SideId } from '../src/sim/entity';
import { createOnlineWorld } from '../src/sim/online';
import { randomSeed } from '../src/sim/rng';
import type { SaveData } from '../src/sim/save/save';
import type { Faction } from '../src/sim/state';
import { lobbyOf, type Env } from './env';
import type { LobbyDO } from './lobby';
import type { AccountRecord, WorldRecord } from './lobby-core';
import { aiModerator, rulesOnly } from './moderation';
import { RoomChat } from './room-chat';
import { RoomCore, type Peer } from './room-core';
import { handleMessage, type RoomContext } from './room-messages';

/** What one world keeps in its storage. */
interface RoomData {
  save: SaveData;
  seats: Record<string, SideId>;
  chat: ChatLine[];
  info: WorldRecord;
}

const SAVE_EVERY_MS = 30_000;
const STEP_TIMER_MS = 50;
/** While nobody plays, the world wakes up this often to catch up (short catch-ups later). */
const IDLE_WAKE_MS = 6 * 3_600_000;
/** Worlds nobody visited for this long stop waking up. */
const SLEEP_AFTER_MS = 30 * 24 * 3_600_000;

/** One online world: the game runs here while somebody is connected. */
export class WorldRoom extends DurableObject<Env> implements RoomContext {
  core?: RoomCore;
  info?: WorldRecord;
  readonly chat: RoomChat;
  readonly peers = new Map<WebSocket, Peer>();
  readonly accounts = new Map<Peer, AccountRecord>();
  readonly lastChat = new Map<Peer, number>();
  private timers: ReturnType<typeof setInterval>[] = [];

  get build(): string | undefined {
    return this.env.BUILD;
  }

  lobby(): DurableObjectStub<LobbyDO> {
    return lobbyOf(this.env);
  }

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    const mod = env.MODERATION === 'rules' ? rulesOnly : aiModerator(env.AI);
    this.chat = new RoomChat(mod, () => Date.now());
    void ctx.blockConcurrencyWhile(() => this.load());
  }

  private async load(): Promise<void> {
    const data = await this.ctx.storage.get<RoomData>('room');
    if (!data) return;
    this.info = data.info;
    this.chat.lines = data.chat;
    this.core = RoomCore.load(data.save, data.seats, () => Date.now());
  }

  async persist(): Promise<void> {
    if (!this.core || !this.info) return;
    this.chat.trim();
    const data: RoomData = {
      save: this.core.save(),
      seats: this.core.seats,
      chat: this.chat.lines,
      info: this.info,
    };
    await this.ctx.storage.put('room', data);
    await lobbyOf(this.env).touchWorld(this.info.id, Object.keys(this.core.seats).length);
  }

  /** Called once by the Worker after the lobby made the world. */
  async init(
    info: WorldRecord,
    owner: { account: string; name: string; faction: Faction },
  ): Promise<void> {
    if (this.core) return;
    this.info = info;
    const state = createOnlineWorld({
      seed: randomSeed(),
      time: Date.now(),
      faction: owner.faction,
      name: owner.name,
      difficulty: info.difficulty,
      computers: info.computers,
      people: info.people,
    });
    this.core = new RoomCore(state, { [owner.account]: 'player' }, () => Date.now());
    await this.persist();
  }

  /** The account was deleted: free its seat. */
  async removeAccount(account: string): Promise<void> {
    this.core?.removeAccount(account);
    await this.persist();
  }

  override fetch(req: Request): Response {
    if (req.headers.get('Upgrade') !== 'websocket')
      return new Response('WebSocket only', { status: 426 });
    const pair = new WebSocketPair();
    const [client, ws] = [pair[0], pair[1]];
    ws.accept();
    const peer: Peer = {
      send: (text) => {
        try {
          ws.send(text);
        } catch {
          /* closed */
        }
      },
      close: (code, reason) => ws.close(code, reason),
    };
    this.peers.set(ws, peer);
    ws.addEventListener('message', (e) => void handleMessage(this, peer, String(e.data)));
    ws.addEventListener('close', () => this.drop(ws));
    ws.addEventListener('error', () => this.drop(ws));
    return new Response(null, { status: 101, webSocket: client });
  }

  /** Somebody is connected: run the steps in real time and save now and then. */
  startTimers(): void {
    if (this.timers.length > 0) return;
    this.timers.push(setInterval(() => this.core?.advance(), STEP_TIMER_MS));
    this.timers.push(setInterval(() => void this.persist(), SAVE_EVERY_MS));
  }

  private drop(ws: WebSocket): void {
    const peer = this.peers.get(ws);
    this.peers.delete(ws);
    if (peer) {
      this.core?.disconnect(peer);
      this.accounts.delete(peer);
      this.lastChat.delete(peer);
    }
    if (this.core && this.core.members.size > 0) return;
    for (const t of this.timers) clearInterval(t);
    this.timers = [];
    void this.persist().then(() => this.ctx.storage.setAlarm(Date.now() + IDLE_WAKE_MS));
  }

  /** Nobody there: catch up the time now and then, so that a later start is quick. */
  override async alarm(): Promise<void> {
    if (!this.core || this.core.members.size > 0) return;
    this.core.advance();
    await this.persist();
    const last = this.info?.lastActive ?? 0;
    if (Date.now() - last < SLEEP_AFTER_MS)
      await this.ctx.storage.setAlarm(Date.now() + IDLE_WAKE_MS);
  }

  send(peer: Peer, msg: ServerMessage): void {
    peer.send(JSON.stringify(msg));
  }
}
