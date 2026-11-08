/**
 * Where the game gets the time from.
 * Build times are real time (seconds up to days), so the game uses a clock, not frame counts.
 * Tests use ManualClock to jump forward ("3 days later").
 */
export interface Clock {
  /** Milliseconds since 1970 (like Date.now()). */
  now(): number;
}

export const realClock: Clock = { now: () => Date.now() };

export class ManualClock implements Clock {
  constructor(private time = 0) {}
  now(): number {
    return this.time;
  }
  advance(ms: number): void {
    this.time += ms;
  }
}

export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;
