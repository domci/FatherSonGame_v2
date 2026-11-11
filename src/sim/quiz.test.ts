import { describe, expect, it } from 'vitest';
import { QUIZ, QUIZ_RULES, QUIZ_TOPICS } from '../content/quiz';
import { HOUR, SECOND } from './clock';
import { applyCommand } from './commands';
import { formatWait, quizStatus } from './quiz';
import { newTestGame } from './test-helpers';
import type { GameState } from './state';

function me(s: GameState) {
  const p = s.players.player;
  if (!p) throw new Error('no player');
  return p;
}

const ask = (s: GameState) => applyCommand(s, { type: 'quizAsk', player: 'player' });
const answer = (s: GameState, choice: number) =>
  applyCommand(s, { type: 'quizAnswer', player: 'player', choice });
/** The shown number of the right answer. */
const rightChoice = (s: GameState): number => me(s).quiz.current?.order.indexOf(0) ?? -1;

describe('quiz questions', () => {
  it('are many, with unique ids, 4 different answers and an explanation', () => {
    expect(QUIZ.length).toBeGreaterThanOrEqual(60);
    expect(new Set(QUIZ.map((x) => x.id)).size).toBe(QUIZ.length);
    for (const x of QUIZ) {
      expect(new Set(x.answers).size, x.id).toBe(4);
      expect(x.explain.length, x.id).toBeGreaterThan(5);
      expect(x.age).toBeGreaterThanOrEqual(10);
    }
    for (const topic of Object.keys(QUIZ_TOPICS))
      expect(QUIZ.filter((x) => x.topic === topic).length, topic).toBeGreaterThanOrEqual(10);
  });
});

describe('knowledge quiz', () => {
  it('gives a crystal for a right answer', () => {
    const s = newTestGame();
    expect(ask(s).ok).toBe(true);
    const open = me(s).quiz.current;
    expect(ask(s).ok).toBe(true);
    expect(me(s).quiz.current).toEqual(open);
    expect(answer(s, rightChoice(s)).ok).toBe(true);
    expect(me(s).resources.crystals).toBe(QUIZ_RULES.reward);
    expect(me(s).quiz.right).toBe(1);
    expect(me(s).quiz.current).toBeUndefined();
    expect(answer(s, 0).ok).toBe(false);
  });

  it('mixes the answers, so the right one is not always first', () => {
    const s = newTestGame();
    const places = new Set<number>();
    for (let i = 0; i < 6; i++) {
      ask(s);
      places.add(rightChoice(s));
      answer(s, rightChoice(s));
    }
    expect(places.size).toBeGreaterThan(1);
  });

  it('pauses for a minute after a wrong answer', () => {
    const s = newTestGame();
    ask(s);
    answer(s, (rightChoice(s) + 1) % 4);
    expect(me(s).resources.crystals ?? 0).toBe(0);
    expect(me(s).quiz.wrong).toBe(1);
    const r = ask(s);
    expect(r.ok).toBe(false);
    expect(!r.ok && r.reason).toContain('Pause');
    s.time += QUIZ_RULES.wrongPauseMs;
    expect(ask(s).ok).toBe(true);
  });

  it('asks at most 6 questions per hour', () => {
    const s = newTestGame();
    for (let i = 0; i < QUIZ_RULES.perHour; i++) {
      expect(ask(s).ok).toBe(true);
      answer(s, rightChoice(s));
      s.time += 5 * SECOND;
    }
    expect(quizStatus(me(s).quiz, s.time).left).toBe(0);
    const r = ask(s);
    expect(!r.ok && r.reason).toContain('Stunde');
    s.time += HOUR;
    expect(ask(s).ok).toBe(true);
  });

  it('repeats a question only when all were asked', () => {
    const s = newTestGame();
    const seen: string[] = [];
    for (let i = 0; i < QUIZ.length; i++) {
      ask(s);
      seen.push(me(s).quiz.current?.id ?? '');
      answer(s, rightChoice(s));
      s.time += HOUR;
    }
    expect(new Set(seen).size).toBe(QUIZ.length);
    ask(s);
    expect(me(s).quiz.current?.id).not.toBe(seen[seen.length - 1]);
    expect(me(s).quiz.asked).toEqual([]);
  });

  it('writes waiting times for kids', () => {
    expect(formatWait(30 * SECOND)).toBe('30 Sekunden');
    expect(formatWait(60 * SECOND)).toBe('1 Minute');
    expect(formatWait(HOUR - 1)).toBe('60 Minuten');
  });
});
