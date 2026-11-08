import { describe, expect, it } from 'vitest';
import { barFor } from './bars';
import type { Entity } from '../sim/entity';

describe('barFor', () => {
  it('shows build progress', () => {
    const e: Entity = {
      id: 1,
      construction: { targetLevel: 1, startedAt: 0, finishAt: 1000, droneId: 2 },
    };
    expect(barFor(e, 250, false)).toEqual({ kind: 'build', value: 0.25 });
  });

  it('shows training progress', () => {
    const e: Entity = { id: 1, training: { unit: 'hunter', finishAt: 20000, queue: [] } };
    expect(barFor(e, 10000, false)?.kind).toBe('train');
  });

  it('shows health only when hurt or selected', () => {
    const e: Entity = { id: 1, health: { hp: 10, max: 10 } };
    expect(barFor(e, 0, false)).toBeNull();
    expect(barFor(e, 0, true)).toEqual({ kind: 'hp', value: 1 });
    e.health = { hp: 5, max: 10 };
    expect(barFor(e, 0, false)).toEqual({ kind: 'hp', value: 0.5 });
  });
});
