import { describe, expect, it } from 'vitest';
import type { NewWorld } from '../src/net/protocol';
import { LIMITS } from '../src/content/online';
import { LobbyCore, type AccountRecord, type Kv, type WorldRecord } from './lobby-core';

/** Durable Object storage as a Map. */
function memoryKv(): Kv {
  const m = new Map<string, unknown>();
  const copy = <T>(v: unknown): T => (v === undefined ? v : JSON.parse(JSON.stringify(v))) as T;
  return {
    get: <T>(k: string) => Promise.resolve(copy<T | undefined>(m.get(k))),
    put: (k, v) => Promise.resolve(void m.set(k, copy(v))),
    delete: (k) => Promise.resolve(m.delete(k)),
    list: <T>({ prefix }: { prefix: string }) =>
      Promise.resolve(
        new Map([...m].filter(([k]) => k.startsWith(prefix)).map(([k, v]) => [k, copy<T>(v)])),
      ),
  };
}

async function account(lobby: LobbyCore, name: string): Promise<{ id: string; key: string }> {
  const a = await lobby.createAccount(name);
  if (!a || a === 'busy') throw new Error('no account');
  return a;
}

async function world(lobby: LobbyCore, a: AccountRecord, w: NewWorld): Promise<WorldRecord> {
  const r = await lobby.createWorld(a, w);
  if (typeof r === 'string') throw new Error(r);
  return r;
}

const NEW_WORLD: NewWorld = {
  name: 'Familie',
  difficulty: 'easy',
  computers: 1,
  people: 2,
  open: false,
  faction: 'human',
};

describe('lobby: accounts, worlds, reports (M7)', () => {
  it('makes accounts only with names from the word lists, and checks the key', async () => {
    const lobby = new LobbyCore(memoryKv(), () => 1000);
    expect(await lobby.createAccount('Max Mustermann')).toBeUndefined();
    const acc = await account(lobby, 'Roter Falke 7');
    expect(acc?.id).toHaveLength(8);
    expect(acc?.key).toHaveLength(16);
    expect((await lobby.verify(acc.id, acc.key))?.name).toBe('Roter Falke 7');
    expect(await lobby.verify(acc.id, 'WRONGKEY00000000')).toBeUndefined();
  });

  it('creates worlds with a join code and lists them', async () => {
    const lobby = new LobbyCore(memoryKv(), () => 1000);
    const a = await account(lobby, 'Roter Falke 7');
    const b = await account(lobby, 'Blauer Komet 3');
    const ra = (await lobby.verify(a.id, a.key))!;
    const w = await world(lobby, ra, NEW_WORLD);
    expect(w.code).toMatch(/^[0-9A-Z]{6}$/);
    expect((await lobby.byCode(w.code.toLowerCase()))?.id).toBe(w.id);
    const mine = await lobby.listWorlds((await lobby.verify(a.id, a.key))!);
    expect(mine.mine.map((x) => [x.id, x.side])).toEqual([[w.id, 'player']]);
    const theirs = await lobby.listWorlds((await lobby.verify(b.id, b.key))!);
    expect(theirs.open).toEqual([]);
    await lobby.setSeat(b.id, w.id, 'ai2');
    expect((await lobby.verify(b.id, b.key))?.worlds).toEqual({ [w.id]: 'ai2' });
  });

  it('lists open worlds while they can still grow, also when the start places are taken', async () => {
    const lobby = new LobbyCore(memoryKv(), () => 1000);
    const a = await account(lobby, 'Roter Falke 7');
    const b = await account(lobby, 'Blauer Komet 3');
    const ra = (await lobby.verify(a.id, a.key))!;
    const w = await world(lobby, ra, { ...NEW_WORLD, open: true });
    const rb = async () => (await lobby.listWorlds((await lobby.verify(b.id, b.key))!)).open;
    await lobby.touchWorld(w.id, 5);
    expect((await rb()).map((x) => x.id)).toEqual([w.id]);
    await lobby.touchWorld(w.id, 11);
    expect(await rb()).toEqual([]);
  });

  it('punishes in steps: warning, chat pauses, then out', async () => {
    let now = 0;
    const lobby = new LobbyCore(memoryKv(), () => now);
    const a = await account(lobby, 'Roter Falke 7');
    const first = await lobby.strike(a.id);
    expect(first.text?.de).toContain('Verwarnung');
    expect(first.chatBanUntil).toBe(0);
    const second = await lobby.strike(a.id);
    expect(second.chatBanUntil).toBe(3_600_000);
    await lobby.strike(a.id);
    await lobby.strike(a.id);
    now = 10;
    const fifth = await lobby.strike(a.id);
    expect(fifth.banned).toBe(true);
  });

  it('keeps reports for the parents until they decide', async () => {
    const lobby = new LobbyCore(memoryKv(), () => 5);
    const a = await account(lobby, 'Roter Falke 7');
    await lobby.report({
      world: 'w',
      reporter: 'x',
      offender: a.id,
      name: 'Roter Falke 7',
      text: 'hm',
    });
    const [r] = await lobby.reports();
    expect(r?.text).toBe('hm');
    await lobby.resolve(r!.id, 'ban');
    expect((await lobby.verify(a.id, a.key))?.banned).toBe(true);
    expect(await lobby.reports()).toEqual([]);
  });

  it('deletes an account and returns its worlds', async () => {
    const lobby = new LobbyCore(memoryKv(), () => 5);
    const a = await account(lobby, 'Roter Falke 7');
    const ra = (await lobby.verify(a.id, a.key))!;
    const w = await world(lobby, ra, NEW_WORLD);
    expect(await lobby.deleteAccount((await lobby.verify(a.id, a.key))!)).toEqual([w.id]);
    expect(await lobby.verify(a.id, a.key)).toBeUndefined();
  });

  it('limits own worlds per account, and new accounts and worlds per hour', async () => {
    let now = 0;
    const lobby = new LobbyCore(memoryKv(), () => now);
    const a = await account(lobby, 'Roter Falke 7');
    for (let i = 0; i < LIMITS.worldsPerAccount; i++)
      await world(lobby, (await lobby.verify(a.id, a.key))!, NEW_WORLD);
    const ra = (await lobby.verify(a.id, a.key))!;
    expect(lobby.ownWorlds(ra)).toBe(LIMITS.worldsPerAccount);
    expect(await lobby.createWorld(ra, NEW_WORLD)).toBe('tooMany');
    for (let i = 1; i < LIMITS.accountsPerHour; i++) await account(lobby, 'Blauer Komet 3');
    expect(await lobby.createAccount('Blauer Komet 3')).toBe('busy');
    now = 3_600_001;
    expect(typeof (await lobby.createAccount('Blauer Komet 3'))).toBe('object');
  });

  it('stops new worlds when too many came in one hour', async () => {
    const lobby = new LobbyCore(memoryKv(), () => 0);
    const fresh = async (): Promise<AccountRecord> => {
      const a = await account(lobby, 'Roter Falke 7');
      return (await lobby.verify(a.id, a.key))!;
    };
    for (let i = 0; i < LIMITS.worldsPerHour; i++) await world(lobby, await fresh(), NEW_WORLD);
    expect(await lobby.createWorld(await fresh(), NEW_WORLD)).toBe('busy');
  });

  it('lists at most some open worlds, the most recently played first', async () => {
    let now = 0;
    const lobby = new LobbyCore(memoryKv(), () => now);
    const ids: string[] = [];
    for (let i = 0; i < LIMITS.openListed + 2; i++) {
      now = i;
      const a = await account(lobby, 'Roter Falke 7');
      ids.push(
        (await world(lobby, (await lobby.verify(a.id, a.key))!, { ...NEW_WORLD, open: true })).id,
      );
    }
    const b = await account(lobby, 'Blauer Komet 3');
    const open = (await lobby.listWorlds((await lobby.verify(b.id, b.key))!)).open;
    expect(open).toHaveLength(LIMITS.openListed);
    expect(open[0]?.id).toBe(ids.at(-1));
    const fresh = new LobbyCore(memoryKv(), () => 0);
    expect((await fresh.listWorlds((await lobby.verify(b.id, b.key))!)).open).toEqual([]);
  });
});
