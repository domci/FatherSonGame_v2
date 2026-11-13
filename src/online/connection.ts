import type { ClientMessage, ServerMessage } from '../net/protocol';
import type { Link, LinkStatus } from './online-game';

const PING_MS = 15_000;
const RETRY_MS = [1000, 2000, 5000, 10_000, 20_000];

/**
 * WebSocket to one world. Says hello after each (re)connect, pings now and then,
 * and tries again when the line breaks (not after the server said no).
 */
export class Connection implements Link {
  onMessage: (msg: ServerMessage) => void = () => undefined;
  onStatus: (s: LinkStatus) => void = () => undefined;
  private ws?: WebSocket;
  private tries = 0;
  private timer?: number;
  private stopped = false;

  constructor(
    private worldId: string,
    private hello: () => ClientMessage,
  ) {}

  open(): void {
    this.onStatus('connecting');
    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${proto}//${location.host}/ws/${this.worldId}`);
    this.ws = ws;
    ws.onopen = () => {
      this.tries = 0;
      ws.send(JSON.stringify(this.hello()));
      this.onStatus('online');
      this.timer = window.setInterval(() => this.send({ t: 'ping' }), PING_MS);
    };
    ws.onmessage = (e) => this.onMessage(JSON.parse(String(e.data)) as ServerMessage);
    ws.onclose = (e) => this.closed(e.code);
  }

  send(msg: ClientMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(msg));
  }

  /** Our side ends the connection (back to the lobby). */
  close(): void {
    this.stopped = true;
    window.clearInterval(this.timer);
    this.ws?.close(1000, 'bye');
    this.onStatus('closed');
  }

  private closed(code: number): void {
    window.clearInterval(this.timer);
    // 4000-4099: the server said no (version, account, full, ban). No new try.
    if (this.stopped || (code >= 4000 && code < 4100)) return this.onStatus('closed');
    this.onStatus('lost');
    const wait = RETRY_MS[Math.min(this.tries, RETRY_MS.length - 1)] ?? 20_000;
    this.tries += 1;
    window.setTimeout(() => !this.stopped && this.open(), wait);
  }
}
