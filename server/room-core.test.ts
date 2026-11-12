import { describe, expect, it } from 'vitest';
import { digest } from '../src/net/digest';
import { Lockstep } from '../src/net/lockstep';
import type { ServerMessage } from '../src/net/protocol';
import type { SideId } from '../src/sim/entity';
import { createOnlineWorld } from '../src/sim/online';
import { RoomCore, type Peer } from './room-core';

const T0 = 1_800_000_000_000;

/** A browser in the test: gets the messages directly. */
class FakeBrowser implements Peer {
  game = new Lockstep();
  inbox: ServerMessage[] = [];
  closed = false;
  mismatches = 0;
  constructor() {
    this.game.onMismatch = () => this.mismatches++;
  }
  send(text: string): void {
    const msg = JSON.parse(text) as ServerMessage;
    this.inbox.push(msg);
    this.game.receive(msg);
  }
  close(): void {
    this.closed = true;
  }
}

function setup(): { room: RoomCore; clock: { t: number } } {
  const clock = { t: T0 };
  const state = createOnlineWorld({
    seed: 4,
    time: T0,
    faction: 'human',
    name: 'Roter Falke 1',
    difficulty: 'normal',
    computers: 1,
    people: 2,
  });
  const room = new RoomCore(state, { acc1: 'player' }, () => clock.t);
  return { room, clock };
}

function join(room: RoomCore, account: string, name: string): FakeBrowser {
  const b = new FakeBrowser();
  const welcome = (side: SideId): ServerMessage => ({
    t: 'welcome',
    side,
    chat: [],
    world: {
      id: 'w',
      code: 'ABCDEF',
      name: 'W',
      difficulty: 'normal',
      computers: 1,
      people: 2,
      taken: 1,
      open: true,
    },
  });
  const err = room.connect(b, { account, name, faction: 'alien' }, welcome);
  expect(err).toBeUndefined();
  return b;
}

function play(room: RoomCore, clock: { t: number }, ms: number, browsers: FakeBrowser[]): void {
  for (let t = 0; t < ms; t += 100) {
    clock.t += 100;
    room.advance();
    for (const b of browsers) b.game.run(10);
  }
}

describe('world server room (M7)', () => {
  it('two browsers replay exactly what the server does', () => {
    const { room, clock } = setup();
    const a = join(room, 'acc1', 'Roter Falke 1');
    const b = join(room, 'acc2', 'Blauer Komet 2');
    expect(a.game.side).toBe('player');
    expect(b.game.side).toBe('ai2');
    expect(room.state.players.ai2?.here).toBe(true);
    const drone = room.state.world.entities.find((e) => e.owner === 'player' && e.unit);
    const x0 = drone?.position?.x ?? 0;
    const y0 = drone?.position?.y ?? 0;
    room.command(a, {
      type: 'move',
      player: 'player',
      unitIds: [drone?.id ?? 0],
      target: { x: x0 + 4, y: y0 },
    });
    play(room, clock, 20_000, [a, b]);
    expect(a.game.backlog).toBe(0);
    expect(digest(a.game.state!)).toBe(digest(room.state));
    expect(digest(b.game.state!)).toBe(digest(room.state));
    expect(a.mismatches + b.mismatches).toBe(0);
    const moved = room.state.world.entities.find((e) => e.id === drone?.id);
    expect(moved?.position?.x).toBeCloseTo(x0 + 4, 0);
  });

  it('commands are always for the own seat; server-only commands are ignored', () => {
    const { room, clock } = setup();
    const a = join(room, 'acc1', 'Roter Falke 1');
    const b = join(room, 'acc2', 'Blauer Komet 2');
    room.command(b, { type: 'diplomacy', player: 'player', side: 'ai', action: 'peace' });
    room.command(b, { type: 'join', player: 'ai3', faction: 'human', name: 'Böse' });
    play(room, clock, 1000, [a, b]);
    const sent = b.inbox.flatMap((m) => (m.t === 'steps' ? m.cmds.map((c) => c[1]) : []));
    const diplomacy = sent.find((c) => c.type === 'diplomacy');
    expect(diplomacy?.player).toBe('ai2');
    expect(sent.some((c) => c.type === 'join')).toBe(false);
  });

  it('a browser that went another way gets a fresh snapshot', () => {
    const { room, clock } = setup();
    const a = join(room, 'acc1', 'Roter Falke 1');
    play(room, clock, 2000, [a]);
    a.game.state!.players.player!.resources.regolith = 99_999;
    play(room, clock, 6000, [a]);
    expect(a.mismatches).toBeGreaterThan(0);
    room.resync();
    play(room, clock, 6000, [a]);
    expect(digest(a.game.state!)).toBe(digest(room.state));
  });

  it('is full when all places are taken; going away and leaving', () => {
    const { room, clock } = setup();
    const a = join(room, 'acc1', 'Roter Falke 1');
    const b = join(room, 'acc2', 'Blauer Komet 2');
    const c = new FakeBrowser();
    expect(
      room.connect(c, { account: 'acc3', name: 'X', faction: 'human' }, () => ({ t: 'pong' })),
    ).toBe('full');
    room.disconnect(b);
    play(room, clock, 500, [a]);
    expect(room.state.players.ai2?.here).toBe(false);
    room.removeAccount('acc2');
    play(room, clock, 500, [a]);
    expect(room.state.players.ai2).toBeUndefined();
    expect(digest(a.game.state!)).toBe(digest(room.state));
  });

  it('a second device of the same account closes the first one', () => {
    const { room } = setup();
    const first = join(room, 'acc1', 'Roter Falke 1');
    join(room, 'acc1', 'Roter Falke 1');
    expect(first.closed).toBe(true);
    expect(room.members.size).toBe(1);
  });

  it('a saved world catches up the time while nobody was there', () => {
    const { room, clock } = setup();
    const save = room.save();
    clock.t += 3_600_000;
    const later = RoomCore.load(save, room.seats, () => clock.t);
    expect(later.state.time).toBe(clock.t);
    const built = (list: { owner?: string; building?: unknown }[]): number =>
      list.filter((e) => e.owner === 'ai' && e.building).length;
    expect(built(later.state.world.entities)).toBeGreaterThan(built(save.entities));
  });
});
