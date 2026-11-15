/** Counts events per key in a sliding time window (kept in memory only, never stored). */
export class RateWindow {
  private hits = new Map<string, number[]>();

  constructor(
    private max: number,
    private windowMs: number,
    private now: () => number,
  ) {}

  /** True (and counted) if the key has room left in the window. */
  take(key: string): boolean {
    const since = this.now() - this.windowMs;
    const list = (this.hits.get(key) ?? []).filter((t) => t > since);
    if (list.length >= this.max) {
      this.hits.set(key, list);
      return false;
    }
    list.push(this.now());
    this.hits.set(key, list);
    if (this.hits.size > 10_000) this.prune(since);
    return true;
  }

  private prune(since: number): void {
    for (const [k, list] of this.hits) if (!list.some((t) => t > since)) this.hits.delete(k);
  }
}

/** The part of a Cloudflare rate limit binding that we use. */
export interface RateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

/** Asks a rate limit binding. No binding (local tests) or an error = allowed. */
export async function allowed(rl: RateLimiter | undefined, key: string): Promise<boolean> {
  if (!rl) return true;
  try {
    return (await rl.limit({ key })).success;
  } catch {
    return true;
  }
}
