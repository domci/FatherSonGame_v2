import type { GameState } from '../sim/state';

/** FNV-1a over a text: a short fingerprint. */
function fnv(text: string, seed = 0x811c9dc5): number {
  let h = seed >>> 0;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

function round(v: number | undefined): number {
  return v === undefined ? -1 : Math.round(v * 100);
}

/**
 * Fingerprint of everything that matters for the game: time, random numbers, all things
 * with place and health, and the stores of all sides. Server and browsers compare it to
 * find a browser that went a different way (then it gets a fresh snapshot).
 */
export function digest(state: GameState): string {
  let h = fnv(`${state.time}|${state.rngState}|${state.nextId}`);
  for (const e of state.world.entities) {
    const p = e.position;
    h = fnv(`${e.id}:${e.owner ?? ''}:${round(p?.x)}:${round(p?.y)}:${round(e.health?.hp)}`, h);
  }
  for (const [id, p] of Object.entries(state.players)) {
    const res = Object.entries(p?.resources ?? {}).map(([k, v]) => `${k}${round(v)}`);
    h = fnv(`${id}:${res.join(',')}`, h);
  }
  return h.toString(16);
}
