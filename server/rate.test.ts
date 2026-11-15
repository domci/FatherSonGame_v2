import { describe, expect, it } from 'vitest';
import { allowed, RateWindow } from './rate';

describe('rate limits', () => {
  it('allows max events per key in the window, then again after it', () => {
    let now = 0;
    const w = new RateWindow(2, 1000, () => now);
    expect(w.take('a')).toBe(true);
    expect(w.take('a')).toBe(true);
    expect(w.take('a')).toBe(false);
    expect(w.take('b')).toBe(true);
    now = 1001;
    expect(w.take('a')).toBe(true);
  });

  it('forgets old keys when there are very many', () => {
    let now = 0;
    const w = new RateWindow(1, 10, () => now);
    for (let i = 0; i <= 10_001; i++) w.take(`k${i}`);
    now = 100;
    expect(w.take('k0')).toBe(true);
  });

  it('asks the binding; without one or on error it allows', async () => {
    expect(await allowed(undefined, 'x')).toBe(true);
    const no = { limit: () => Promise.resolve({ success: false }) };
    expect(await allowed(no, 'x')).toBe(false);
    const broken = { limit: () => Promise.reject(new Error('down')) };
    expect(await allowed(broken, 'x')).toBe(true);
  });
});
