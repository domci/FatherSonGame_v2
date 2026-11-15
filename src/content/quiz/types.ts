import { L, type Loc } from '../text';

/** Topics of the knowledge quiz. */
export const QUIZ_TOPICS = {
  space: L('Weltraum', 'Space'),
  physics: L('Physik', 'Physics'),
  math: L('Mathe', 'Math'),
  nature: L('Natur', 'Nature'),
  geo: L('Erdkunde', 'Geography'),
} as const;
export type QuizTopic = keyof typeof QUIZ_TOPICS;

export interface QuizQuestion {
  id: string;
  topic: QuizTopic;
  /** Youngest age the question is for. */
  age: number;
  question: Loc;
  /** The FIRST answer is the right one. The game mixes the order. */
  answers: readonly [Loc, Loc, Loc, Loc];
  /** Short explanation, shown after the answer. */
  explain: Loc;
}

type Four = readonly [string, string, string, string];
/** One language of a question: question, four answers (right one first), explanation. */
export type QuizText = readonly [string, Four, string];

/** Short way to write a question in the topic files: German, then English. */
export function q(
  topic: QuizTopic,
  id: string,
  de: QuizText,
  en: QuizText,
  age = 10,
): QuizQuestion {
  const a = (i: 0 | 1 | 2 | 3): Loc => L(de[1][i], en[1][i]);
  const answers: QuizQuestion['answers'] = [a(0), a(1), a(2), a(3)];
  return {
    id: `${topic}-${id}`,
    topic,
    age,
    question: L(de[0], en[0]),
    answers,
    explain: L(de[2], en[2]),
  };
}
