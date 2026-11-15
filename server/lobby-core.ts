import { STRIKES } from '../src/content/chat';
import { LIMITS, ONLINE } from '../src/content/online';
import { isGoodName } from '../src/net/names';
import type {
  AccountInfo,
  NewWorld,
  ReportAction,
  ReportInfo,
  WorldInfo,
} from '../src/net/protocol';
import type { SideId } from '../src/sim/entity';
import { randomCode, sha256 } from './ids';
import { RateWindow } from './rate';
import { WorldIndex } from './world-index';
import type { Loc } from '../src/content/text';

/** The part of Durable Object storage we use (a Map in tests). */
export interface Kv {
  get<T>(key: string): Promise<T | undefined>;
  put(key: string, value: unknown): Promise<void>;
  delete(key: string): Promise<boolean>;
  list<T>(options: { prefix: string }): Promise<Map<string, T>>;
}

/** No e-mail, no password, no real name: only a made-up name and a secret key (as hash). */
export interface AccountRecord extends AccountInfo {
  keyHash: string;
  created: number;
  banned: boolean;
  /** World id → seat. */
  worlds: Record<string, SideId>;
}

export interface WorldRecord extends Omit<WorldInfo, 'side'> {
  owner: string;
  created: number;
  lastActive: number;
}

export type Report = ReportInfo;

/** A world as the lobby shows it (without owner and times). */
export function publicInfo(w: WorldRecord, side?: SideId): WorldInfo {
  const info: WorldInfo = {
    id: w.id,
    code: w.code,
    name: w.name,
    difficulty: w.difficulty,
    computers: w.computers,
    people: w.people,
    taken: w.taken,
    open: w.open,
  };
  if (side) info.side = side;
  return info;
}

/** Accounts, worlds and reports: one place for the whole game (a Durable Object). */
export class LobbyCore {
  private newAccounts: RateWindow;
  private newWorlds: RateWindow;
  private index: WorldIndex;

  constructor(
    private kv: Kv,
    private now: () => number,
  ) {
    this.newAccounts = new RateWindow(LIMITS.accountsPerHour, 3_600_000, now);
    this.newWorlds = new RateWindow(LIMITS.worldsPerHour, 3_600_000, now);
    this.index = new WorldIndex(kv);
  }

  /** A new account, undefined for a bad name, 'busy' when too many came in the last hour. */
  async createAccount(name: string): Promise<{ id: string; key: string } | 'busy' | undefined> {
    if (!isGoodName(name)) return undefined;
    if (!this.newAccounts.take('all')) return 'busy';
    const id = randomCode(8);
    const key = randomCode(16);
    const record: AccountRecord = {
      id,
      name,
      keyHash: await sha256(key),
      created: this.now(),
      strikes: 0,
      chatBanUntil: 0,
      banned: false,
      worlds: {},
    };
    await this.kv.put(`acc:${id}`, record);
    return { id, key };
  }

  /** The account, if the key fits. */
  async verify(id: string, key: string): Promise<AccountRecord | undefined> {
    const a = await this.kv.get<AccountRecord>(`acc:${id}`);
    if (!a || a.keyHash !== (await sha256(key))) return undefined;
    return a;
  }

  async rename(a: AccountRecord, name: string): Promise<boolean> {
    if (!isGoodName(name)) return false;
    await this.kv.put(`acc:${a.id}`, { ...a, name });
    return true;
  }

  /** Deletes the account. Returns its worlds (the rooms free the seats). */
  async deleteAccount(a: AccountRecord): Promise<string[]> {
    await this.kv.delete(`acc:${a.id}`);
    return Object.keys(a.worlds);
  }

  /** Worlds this account made itself (its seat there is the maker's seat). */
  ownWorlds(a: AccountRecord): number {
    return Object.values(a.worlds).filter((side) => side === 'player').length;
  }

  /** A new world, or why not: the account has enough worlds, or the game is busy. */
  async createWorld(a: AccountRecord, w: NewWorld): Promise<WorldRecord | 'tooMany' | 'busy'> {
    if (this.ownWorlds(a) >= LIMITS.worldsPerAccount) return 'tooMany';
    if (!this.newWorlds.take('all')) return 'busy';
    let code = randomCode(6);
    while (await this.kv.get(`code:${code}`)) code = randomCode(6);
    const record: WorldRecord = {
      id: randomCode(12),
      code,
      name: w.name.trim().slice(0, 40) || 'Neue Welt',
      difficulty: w.difficulty,
      computers: w.computers,
      people: w.people,
      taken: 1,
      open: w.open,
      owner: a.id,
      created: this.now(),
      lastActive: this.now(),
    };
    await this.index.put(record);
    await this.kv.put(`code:${code}`, record.id);
    await this.setSeat(a.id, record.id, 'player');
    return record;
  }

  async world(id: string): Promise<WorldRecord | undefined> {
    return this.index.get(id);
  }

  async byCode(code: string): Promise<WorldRecord | undefined> {
    const id = await this.kv.get<string>(`code:${code.trim().toUpperCase()}`);
    return id ? this.world(id) : undefined;
  }

  /** Your worlds, and the most recently played open worlds with room (worlds grow). */
  async listWorlds(a: AccountRecord): Promise<{ mine: WorldInfo[]; open: WorldInfo[] }> {
    const all = await this.index.all();
    const info = (w: WorldRecord): WorldInfo => publicInfo(w, a.worlds[w.id]);
    const mine = all.filter((w) => a.worlds[w.id]).map(info);
    const room = (w: WorldRecord): boolean => w.taken + w.computers < ONLINE.maxGrownSides;
    const open = all
      .filter((w) => !a.worlds[w.id] && w.open && room(w))
      .sort((x, y) => y.lastActive - x.lastActive)
      .slice(0, LIMITS.openListed)
      .map(info);
    return { mine, open };
  }

  /** Remembers the seat of an account in a world (or forgets it with undefined). */
  async setSeat(account: string, world: string, side: SideId | undefined): Promise<void> {
    const a = await this.kv.get<AccountRecord>(`acc:${account}`);
    if (!a) return;
    const worlds = Object.fromEntries(Object.entries(a.worlds).filter(([w]) => w !== world));
    if (side) worlds[world] = side;
    await this.kv.put(`acc:${account}`, { ...a, worlds });
  }

  async touchWorld(id: string, taken: number): Promise<void> {
    const w = await this.world(id);
    if (w) await this.index.put({ ...w, taken, lastActive: this.now() });
  }

  /** One more bad message: warning, chat pause, then out. Returns the text for the person. */
  async strike(account: string): Promise<{ text?: Loc; chatBanUntil: number; banned: boolean }> {
    const a = await this.kv.get<AccountRecord>(`acc:${account}`);
    const step = STRIKES[Math.min(STRIKES.length - 1, a?.strikes ?? 0)];
    if (!a || !step) return { chatBanUntil: 0, banned: false };
    const chatBanUntil = step.banMs > 0 ? this.now() + step.banMs : a.chatBanUntil;
    const banned = a.banned || !!step.out;
    await this.kv.put(`acc:${account}`, { ...a, strikes: a.strikes + 1, chatBanUntil, banned });
    return { text: step.text, chatBanUntil, banned };
  }

  async report(r: Omit<Report, 'id' | 'time'>): Promise<void> {
    const time = this.now();
    const id = `${time}-${randomCode(4)}`;
    await this.kv.put(`report:${id}`, { ...r, id, time });
  }

  async reports(): Promise<Report[]> {
    return [...(await this.kv.list<Report>({ prefix: 'report:' })).values()];
  }

  /** Parents/admin: close a report, and maybe punish the writer. */
  async resolve(id: string, action: ReportAction): Promise<void> {
    const r = await this.kv.get<Report>(`report:${id}`);
    if (!r) return;
    if (action === 'strike') await this.strike(r.offender);
    if (action === 'ban') {
      const a = await this.kv.get<AccountRecord>(`acc:${r.offender}`);
      if (a) await this.kv.put(`acc:${a.id}`, { ...a, banned: true });
    }
    await this.kv.delete(`report:${id}`);
  }
}
