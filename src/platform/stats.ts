/**
 * Visitor statistics with onedollarstats (no cookies, no personal data).
 * Loaded only on the live game, so local runs and tests send nothing.
 * Events never carry names, chat text, codes or ids: only fixed words and small numbers.
 */
const LIVE_HOST = 'crashlanded.dom-builds.com';
const SCRIPT = 'https://assets.onedollarstats.com/stonks.js';

type Props = Record<string, string | number | boolean>;

interface Stonks {
  event(name: string, props?: Record<string, string>): void;
}

const sentOnce = new Set<string>();

/** Adds the stats script (live game only). */
export function startStats(host = location.hostname): boolean {
  if (host !== LIVE_HOST || document.querySelector(`script[src="${SCRIPT}"]`)) return false;
  const s = document.createElement('script');
  s.defer = true;
  s.src = SCRIPT;
  document.head.append(s);
  return true;
}

/** Counts one event. Does nothing if the script is missing or blocked. */
export function track(name: string, props?: Props): void {
  const stonks = (window as unknown as { stonks?: Stonks }).stonks;
  if (!stonks) return;
  const p = props && Object.fromEntries(Object.entries(props).map(([k, v]) => [k, String(v)]));
  try {
    stonks.event(name, p);
  } catch {
    /* stats must never break the game */
  }
}

/** Counts an event only once per page load (for example the first building). */
export function trackOnce(name: string, props?: Props, key = name): void {
  if (sentOnce.has(key)) return;
  sentOnce.add(key);
  track(name, props);
}
