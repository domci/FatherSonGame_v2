import type { WorldInfo } from '../net/protocol';
import {
  api,
  ApiError,
  deviceCode,
  fromDeviceCode,
  loadAccount,
  storeAccount,
} from '../online/api';
import type { StoredAccount } from '../online/api';
import { Connection } from '../online/connection';
import { OnlineError, OnlineGame } from '../online/online-game';
import type { Faction } from '../sim/state';
import { joinDialog, lobbyScreen, newWorldDialog } from '../ui/online-lobby';
import { confirmDialog, deviceCodeDialog, namePicker, waitScreen } from '../ui/online-menu';
import { startGame } from './game-app';

/** The version of this page; the server sends "reload" when it runs a newer one. */
const BUILD: string = import.meta.env.VITE_BUILD ?? 'dev';

const text = (e: unknown): string => (e instanceof Error ? e.message : String(e));

/** Online screens: name, lobby, new world, join, then the game (M7). */
export class OnlineFlow {
  constructor(
    private root: HTMLElement,
    private toMenu: () => void,
  ) {}

  start(): void {
    const a = loadAccount();
    if (a) void this.lobby(a);
    else this.pickName();
  }

  private show(screen: HTMLElement): void {
    this.root.replaceChildren(screen);
  }

  private pickName(problem?: string): void {
    this.show(
      namePicker(
        {
          pick: (name) => void this.createAccount(name),
          login: (code) => void this.login(code),
          back: this.toMenu,
        },
        problem,
      ),
    );
  }

  private async createAccount(name: string): Promise<void> {
    try {
      const made = await api.createAccount(name);
      const a = { ...made, name };
      storeAccount(a);
      await this.lobby(a);
    } catch (e) {
      this.pickName(text(e));
    }
  }

  private async login(code: string): Promise<void> {
    const ids = fromDeviceCode(code);
    if (!ids) return this.pickName('Der Code hat 24 Zeichen. Bitte genau abschreiben.');
    try {
      const me = await api.me({ ...ids, name: '' });
      const a = { ...ids, name: me.name };
      storeAccount(a);
      await this.lobby(a);
    } catch (e) {
      this.pickName(text(e));
    }
  }

  /** The account is gone (deleted on another device): start again with a name. */
  private lost(e: unknown): boolean {
    if (!(e instanceof ApiError) || e.status !== 401) return false;
    storeAccount(undefined);
    this.pickName('Dein Konto gibt es nicht mehr. Wähle einen neuen Namen.');
    return true;
  }

  private async lobby(a: StoredAccount, problem?: string): Promise<void> {
    this.show(waitScreen('Verbinde …'));
    try {
      const worlds = await api.worlds(a);
      this.show(
        lobbyScreen(
          a.name,
          worlds,
          {
            enter: (w) => this.enter(a, w),
            joinCode: (code) => void this.joinCode(a, code),
            newWorld: () => this.newWorld(a),
            deviceCode: () => this.show(deviceCodeDialog(deviceCode(a), () => void this.lobby(a))),
            deleteAccount: () => this.deleteAccount(a),
            back: this.toMenu,
          },
          problem,
        ),
      );
    } catch (e) {
      if (!this.lost(e)) this.offline(text(e));
    }
  }

  /** No server: say so, with a way back. */
  private offline(problem: string): void {
    this.show(
      namePicker({ pick: () => undefined, login: () => undefined, back: this.toMenu }, problem),
    );
    this.root.querySelector('.name-list')?.remove();
  }

  private enter(a: StoredAccount, w: WorldInfo): void {
    if (w.side) return void this.play(a, w);
    this.show(
      joinDialog(
        w,
        (f) => void this.play(a, w, f),
        () => void this.lobby(a),
      ),
    );
  }

  private async joinCode(a: StoredAccount, code: string): Promise<void> {
    try {
      this.enter(a, await api.byCode(a, code));
    } catch (e) {
      if (!this.lost(e)) await this.lobby(a, text(e));
    }
  }

  private newWorld(a: StoredAccount): void {
    const create = async (w: Parameters<typeof api.createWorld>[1]): Promise<void> => {
      this.show(waitScreen('Baue die Welt …'));
      try {
        await this.play(a, await api.createWorld(a, w));
      } catch (e) {
        await this.lobby(a, text(e));
      }
    };
    this.show(
      newWorldDialog(
        a.name,
        (w) => void create(w),
        () => void this.lobby(a),
      ),
    );
  }

  private deleteAccount(a: StoredAccount): void {
    const run = async (): Promise<void> => {
      try {
        await api.deleteMe(a);
        storeAccount(undefined);
        this.toMenu();
      } catch (e) {
        await this.lobby(a, text(e));
      }
    };
    this.show(
      confirmDialog(
        'Konto löschen',
        `„${a.name}“ wird gelöscht, mit allen Chat-Sperren und Plätzen in Welten. Das geht nicht rückgängig.`,
        { label: 'Löschen', run: () => void run() },
        () => void this.lobby(a),
      ),
    );
  }

  private async play(a: StoredAccount, w: WorldInfo, faction?: Faction): Promise<void> {
    this.show(waitScreen('Landeanflug …'));
    const hello = { t: 'hello' as const, account: a.id, key: a.key, build: BUILD, faction };
    const game = new OnlineGame(new Connection(w.id, () => hello));
    try {
      const state = await game.start();
      await startGame(this.root, state, {
        online: game,
        onQuit: (problem) => this.afterGame(a, problem),
      });
    } catch (e) {
      game.leave();
      this.afterGame(a, e instanceof Error ? e : new Error(text(e)));
    }
  }

  private afterGame(a: StoredAccount, problem?: Error): void {
    if (problem instanceof OnlineError && problem.code === 'reload') return location.reload();
    if (problem instanceof OnlineError && problem.code === 'auth') {
      storeAccount(undefined);
      return this.pickName(problem.message);
    }
    void this.lobby(a, problem?.message);
  }
}
