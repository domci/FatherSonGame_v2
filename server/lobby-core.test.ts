import { describe, expect, it } from 'vitest';
import { LobbyCore, type Kv } from './lobby-core';

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

const NEW_WORLD = {
  name: 'Familie',
  difficulty: 'easy',
  computers: 1,
  people: 2,
  open: false,
  faction: 'human',
} as const;

describe('lobby: accounts, worlds, reports (M7)', () => {
  it('makes accounts only with names from the word lists, and checks the key', async () => {
    const lobby = new LobbyCore(memoryKv(), () => 1000);
    expect(await lobby.createAccount('Max Mustermann')).toBeUndefined();
    const acc = await lobby.createAccount('Roter Falke 7');
    expect(acc?.id).toHaveLength(8);
    expect(acc?.key).toHaveLength(16);
    expect((await lobby.verify(acc!.id, acc!.key))?.name).toBe('Roter Falke 7');
    expect(await lobby.verify(acc!.id, 'WRONGKEY00000000')).toBeUndefined();
  });

  it('creates worlds with a join code and lists them', async () => {
    const lobby = new LobbyCore(memoryKv(), () => 1000);
    const a = await lobby.createAccount('Roter Falke 7');
    const b = await lobby.createAccount('Blauer Komet 3');
    const ra = (await lobby.verify(a!.id, a!.key))!;
    const w = await lobby.createWorld(ra, NEW_WORLD);
    expect(w.code).toMatch(/^[0-9A-Z]{6}$/);
    expect((await lobby.byCode(w.code.toLowerCase()))?.id).toBe(w.id);
    const mine = await lobby.listWorlds((await lobby.verify(a!.id, a!.key))!);
    expect(mine.mine.map((x) => [x.id, x.side])).toEqual([[w.id, 'player']]);
    const theirs = await lobby.listWorlds((await lobby.verify(b!.id, b!.key))!);
    expect(theirs.open).toEqual([]);
    await lobby.setSeat(b!.id, w.id, 'ai2');
    expect((await lobby.verify(b!.id, b!.key))?.worlds).toEqual({ [w.id]: 'ai2' });
  });

  it('punishes in steps: warning, chat pauses, then out', async () => {
    let now = 0;
    const lobby = new LobbyCore(memoryKv(), () => now);
    const a = await lobby.createAccount('Roter Falke 7');
    const first = await lobby.strike(a!.id);
    expect(first.text).toContain('Verwarnung');
    expect(first.chatBanUntil).toBe(0);
    const second = await lobby.strike(a!.id);
    expect(second.chatBanUntil).toBe(3_600_000);
    await lobby.strike(a!.id);
    await lobby.strike(a!.id);
    now = 10;
    const fifth = await lobby.strike(a!.id);
    expect(fifth.banned).toBe(true);
  });

  it('keeps reports for the parents until they decide', async () => {
    const lobby = new LobbyCore(memoryKv(), () => 5);
    const a = await lobby.createAccount('Roter Falke 7');
    await lobby.report({
      world: 'w',
      reporter: 'x',
      offender: a!.id,
      name: 'Roter Falke 7',
      text: 'hm',
    });
    const [r] = await lobby.reports();
    expect(r?.text).toBe('hm');
    await lobby.resolve(r!.id, 'ban');
    expect((await lobby.verify(a!.id, a!.key))?.banned).toBe(true);
    expect(await lobby.reports()).toEqual([]);
  });

  it('deletes an account and returns its worlds', async () => {
    const lobby = new LobbyCore(memoryKv(), () => 5);
    const a = await lobby.createAccount('Roter Falke 7');
    const ra = (await lobby.verify(a!.id, a!.key))!;
    const w = await lobby.createWorld(ra, NEW_WORLD);
    expect(await lobby.deleteAccount((await lobby.verify(a!.id, a!.key))!)).toEqual([w.id]);
    expect(await lobby.verify(a!.id, a!.key)).toBeUndefined();
  });
});
