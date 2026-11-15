import { describe, expect, it } from 'vitest';
import type { GameEvent } from '../sim/state';
import { same } from '../content/text';
import { freshEvents } from './toasts';

const ev = (time: number, s: string, to?: GameEvent['to']): GameEvent =>
  to ? { time, text: same(s), kind: 'info', to } : { time, text: same(s), kind: 'info' };

describe('toasts', () => {
  it('shows only new news for my side, also after the state was replaced', () => {
    const seen = { time: -Infinity, texts: new Set<string>() };
    expect(freshEvents([ev(1, 'a')], 'player', seen)).toHaveLength(1);
    const events = [ev(1, 'a'), ev(2, 'b'), ev(2, 'c', 'ai2'), ev(2, 'd', 'player')];
    expect(freshEvents(events, 'player', seen).map((e) => e.text.de)).toEqual(['b', 'd']);
    const copy = events.map((e) => ({ ...e }));
    expect(freshEvents(copy, 'player', seen)).toEqual([]);
    copy.push(ev(2, 'e'));
    expect(freshEvents(copy, 'player', seen).map((e) => e.text.de)).toEqual(['e']);
  });
});
