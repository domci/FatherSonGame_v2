import type { Kv, WorldRecord } from './lobby-core';

/** All worlds in memory (loaded once from storage), so the lobby list stays fast with many worlds. */
export class WorldIndex {
  private worlds?: Map<string, WorldRecord>;

  constructor(private kv: Kv) {}

  private async load(): Promise<Map<string, WorldRecord>> {
    if (!this.worlds) {
      const stored = await this.kv.list<WorldRecord>({ prefix: 'world:' });
      this.worlds = new Map([...stored.values()].map((w) => [w.id, w]));
    }
    return this.worlds;
  }

  async all(): Promise<WorldRecord[]> {
    return [...(await this.load()).values()];
  }

  async get(id: string): Promise<WorldRecord | undefined> {
    return (await this.load()).get(id);
  }

  async put(w: WorldRecord): Promise<void> {
    (await this.load()).set(w.id, w);
    await this.kv.put(`world:${w.id}`, w);
  }
}
