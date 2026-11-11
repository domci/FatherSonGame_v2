import { QUIZ, QUIZ_RULES } from '../content/quiz';
import { HOUR } from './clock';
import { nextRandom } from './game';
import type { GameState, PlayerState, QuizState } from './state';

export function newQuiz(): QuizState {
  return { asked: [], answers: [], pauseUntil: 0, right: 0, wrong: 0 };
}

export interface QuizStatus {
  /** A question can be asked now (or one is open). */
  ready: boolean;
  /** Questions left in this hour. */
  left: number;
  /** Time until the next question when not ready (ms). */
  waitMs: number;
  /** Why there is no question now. */
  reason?: 'pause' | 'hour';
}

/** Can the player get a question now? */
export function quizStatus(quiz: QuizState, now: number): QuizStatus {
  const recent = quiz.answers.filter((t) => t > now - HOUR);
  const left = Math.max(0, QUIZ_RULES.perHour - recent.length);
  if (quiz.current) return { ready: true, left, waitMs: 0 };
  if (quiz.pauseUntil > now)
    return { ready: false, left, waitMs: quiz.pauseUntil - now, reason: 'pause' };
  if (left === 0) {
    const oldest = Math.min(...recent);
    return { ready: false, left, waitMs: oldest + HOUR - now, reason: 'hour' };
  }
  return { ready: true, left, waitMs: 0 };
}

/** Picks a question that was not asked in this round, with its answers in a random order. */
export function pickQuestion(state: GameState, player: PlayerState): void {
  const quiz = player.quiz;
  let pool = QUIZ.filter((x) => !quiz.asked.includes(x.id));
  if (pool.length === 0) {
    const last = quiz.asked[quiz.asked.length - 1];
    quiz.asked = [];
    pool = QUIZ.filter((x) => x.id !== last);
  }
  const pick = pool[Math.floor(nextRandom(state) * pool.length)] ?? QUIZ[0];
  if (!pick) return;
  const order = [0, 1, 2, 3];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(nextRandom(state) * (i + 1));
    [order[i], order[j]] = [order[j] ?? 0, order[i] ?? 0];
  }
  quiz.current = { id: pick.id, order };
}

/** "45 Sekunden" or "12 Minuten" (for messages). */
export function formatWait(ms: number): string {
  const s = Math.max(1, Math.ceil(ms / 1000));
  if (s < 60) return `${s} Sekunden`;
  const m = Math.ceil(s / 60);
  return m === 1 ? '1 Minute' : `${m} Minuten`;
}

/** Is the shown answer number `choice` the right one? */
export function isRight(quiz: QuizState, choice: number): boolean {
  return quiz.current?.order[choice] === 0;
}
