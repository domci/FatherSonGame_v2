import { DurableObject } from 'cloudflare:workers';
import type { NewWorld, WorldInfo } from '../src/net/protocol';
import type { SideId } from '../src/sim/entity';
import type { Env } from './env';
import { LobbyCore, type AccountRecord, type Report, type WorldRecord } from './lobby-core';

/** The one lobby of the game: accounts, worlds and reports (thin shell around LobbyCore). */
export class LobbyDO extends DurableObject<Env> {
  private core = new LobbyCore(this.ctx.storage, () => Date.now());

  createAccount(name: string): Promise<{ id: string; key: string } | undefined> {
    return this.core.createAccount(name);
  }
  verify(id: string, key: string): Promise<AccountRecord | undefined> {
    return this.core.verify(id, key);
  }
  rename(a: AccountRecord, name: string): Promise<boolean> {
    return this.core.rename(a, name);
  }
  deleteAccount(a: AccountRecord): Promise<string[]> {
    return this.core.deleteAccount(a);
  }
  createWorld(a: AccountRecord, w: NewWorld): Promise<WorldRecord> {
    return this.core.createWorld(a, w);
  }
  world(id: string): Promise<WorldRecord | undefined> {
    return this.core.world(id);
  }
  byCode(code: string): Promise<WorldRecord | undefined> {
    return this.core.byCode(code);
  }
  listWorlds(a: AccountRecord): Promise<{ mine: WorldInfo[]; open: WorldInfo[] }> {
    return this.core.listWorlds(a);
  }
  setSeat(account: string, world: string, side: SideId | undefined): Promise<void> {
    return this.core.setSeat(account, world, side);
  }
  touchWorld(id: string, taken: number): Promise<void> {
    return this.core.touchWorld(id, taken);
  }
  strike(account: string): Promise<{ text: string; chatBanUntil: number; banned: boolean }> {
    return this.core.strike(account);
  }
  report(r: Omit<Report, 'id' | 'time'>): Promise<void> {
    return this.core.report(r);
  }
  reports(): Promise<Report[]> {
    return this.core.reports();
  }
  resolve(id: string, action: 'dismiss' | 'strike' | 'ban'): Promise<void> {
    return this.core.resolve(id, action);
  }
}
