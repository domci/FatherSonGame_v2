import { describe, expect, it } from 'vitest';
import { RoomCore, type Peer } from '../../server/room-core';
import { digest } from '../net/digest';
import type { ClientMessage, ServerMessage } from '../net/protocol';
import { createOnlineWorld } from '../sim/online';
import { OnlineGame, OnlineError, type Link, type LinkStatus } from './online-game';

const T0 = 1_800_000_000_000;
const WORLD = {
  id: 'w',
  code: 'ABCDEF',
  name: 'W',
  difficulty: 'normal' as const,
  computers: 1,
  people: 2,
  taken: 1,
  open: true,
};

/** A link that talks directly to a RoomCore (no network). */
class FakeLink implements Link, Peer {
  onMessage: (msg: ServerMessage) => void = () => undefined;
  onStatus: (s: LinkStatus) => void = () => undefined;
  sent: ClientMessage[] = [];
  closed = false;
  constructor(
    private room: RoomCore,
    private account: string,
  ) {}
  open(): void {
    this.onStatus('online');
    const who = { account: this.account, name: this.account, faction: 'alien' as const };
    const err = this.room.connect(this, who, (side) => ({
      t: 'welcome',
      side,
      chat: [],
      world: { ...WORLD, side },
    }));
    if (err) this.onMessage({ t: 'error', code: err, text: 'voll' });
  }
  send(msg: ClientMessage | string): void {
    if (typeof msg === 'string') return this.onMessage(JSON.parse(msg) as ServerMessage);
    this.sent.push(msg);
    if (msg.t === 'cmd') this.room.command(this, msg.cmd);
    if (msg.t === 'resync') this.room.resync();
  }
  close(): void {
    this.closed = true;
    this.room.disconnect(this);
  }
}

function setup(people = 2): { room: RoomCore; clock: { t: number } } {
  const clock = { t: T0 };
  const state = createOnlineWorld({
    seed: 9,
    time: T0,
    faction: 'human',
    name: 'acc1',
    difficulty: 'normal',
    computers: 1,
    people,
  });
  return { room: new RoomCore(state, { acc1: 'player' }, () => clock.t), clock };
}

function play(room: RoomCore, clock: { t: number }, ms: number, games: OnlineGame[]): void {
  for (let t = 0; t < ms; t += 100) {
    clock.t += 100;
    room.advance();
    for (const g of games) g.step();
  }
  // The server sends steps in pairs: let the browsers catch up before comparing.
  for (const g of games) g.lockstep.run(100);
}

describe('online game in the browser (M7)', () => {
  it('starts with the server state and replays it step by step', async () => {
    const { room, clock } = setup();
    const game = new OnlineGame(new FakeLink(room, 'acc1'));
    const state = await game.start();
    expect(game.me).toBe('player');
    expect(game.world?.side).toBe('player');
    expect(game.status).toBe('online');
    play(room, clock, 5000, [game]);
    expect(digest(game.lockstep.state ?? state)).toBe(digest(room.state));
  });

  it('a second person joining gives everybody a fresh state', async () => {
    const { room, clock } = setup();
    const a = new OnlineGame(new FakeLink(room, 'acc1'));
    await a.start();
    const fresh: unknown[] = [];
    a.onState = (s) => fresh.push(s);
    const b = new OnlineGame(new FakeLink(room, 'acc2'));
    await b.start();
    expect(b.me).toBe('ai2');
    expect(fresh).toHaveLength(1);
    play(room, clock, 3000, [a, b]);
    expect(digest(b.lockstep.state!)).toBe(digest(room.state));
  });

  it('a full world says no at the start', async () => {
    const { room } = setup(1);
    await new OnlineGame(new FakeLink(room, 'acc1')).start();
    const late = new OnlineGame(new FakeLink(room, 'acc9'));
    await expect(late.start()).rejects.toBeInstanceOf(OnlineError);
  });

  it('own commands go to the server; a failed one comes back as a notice', async () => {
    const { room, clock } = setup();
    const game = new OnlineGame(new FakeLink(room, 'acc1'));
    await game.start();
    const notes: string[] = [];
    game.onNotice = (text) => notes.push(text);
    game.send({
      type: 'build',
      player: 'player',
      zone: 'nowhere',
      building: 'solarField',
      tileX: -999,
      tileY: 0,
    });
    play(room, clock, 1000, [game]);
    expect(notes.length).toBe(1);
  });

  it('asks for a fresh state after a mismatch, but not too often', async () => {
    const { room, clock } = setup();
    const now = { t: 0 };
    const link = new FakeLink(room, 'acc1');
    const game = new OnlineGame(link, () => now.t);
    await game.start();
    game.lockstep.state!.players.player!.resources.regolith = 12_345;
    play(room, clock, 12_000, [game]);
    const resyncs = link.sent.filter((m) => m.t === 'resync').length;
    expect(resyncs).toBe(1);
    play(room, clock, 6000, [game]);
    expect(digest(game.lockstep.state!)).toBe(digest(room.state));
  });

  it('keeps chat lines, passes notices and errors on, and leaves', async () => {
    const { room } = setup();
    const link = new FakeLink(room, 'acc1');
    const game = new OnlineGame(link);
    await game.start();
    const seen: string[] = [];
    game.onChat = (l) => seen.push(l.text);
    game.onError = (e) => seen.push(e.code);
    const to = { kind: 'world' } as const;
    for (let i = 0; i < 105; i++)
      link.onMessage({
        t: 'chat',
        line: { id: String(i), time: i, from: 'ai2', name: 'B', to, text: `m${i}` },
      });
    expect(game.chat).toHaveLength(100);
    expect(game.chat[0]?.text).toBe('m5');
    link.onMessage({ t: 'error', code: 'banned', text: 'raus' });
    expect(seen.at(-1)).toBe('banned');
    game.say(to, 'Hallo');
    game.say(to, 2);
    game.report('7');
    expect(link.sent.map((m) => m.t)).toEqual(['chat', 'chat', 'report']);
    game.leave();
    expect(link.closed).toBe(true);
  });
});
