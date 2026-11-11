import { GEO } from './geo';
import { MATH } from './math';
import { NATURE } from './nature';
import { PHYSICS } from './physics';
import { SPACE } from './space';
import type { QuizQuestion } from './types';

export { QUIZ_TOPICS, type QuizQuestion, type QuizTopic } from './types';

/** All quiz questions. Add new ones in the topic files. */
export const QUIZ: readonly QuizQuestion[] = [...SPACE, ...PHYSICS, ...MATH, ...NATURE, ...GEO];

export const QUIZ_BY_ID: ReadonlyMap<string, QuizQuestion> = new Map(QUIZ.map((x) => [x.id, x]));

/** Rules of the quiz. Change numbers here to balance the game. */
export const QUIZ_RULES = {
  /** Questions per hour of game time. */
  perHour: 6,
  /** Pause after a wrong answer. */
  wrongPauseMs: 60_000,
  /** Knowledge crystals for a right answer. */
  reward: 1,
  /** Speed-up price: crystals = ceil(sqrt(minutes left)), at least 1. */
  minPrice: 1,
} as const;
