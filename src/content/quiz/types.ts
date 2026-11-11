/** Topics of the knowledge quiz. */
export const QUIZ_TOPICS = {
  space: 'Weltraum',
  physics: 'Physik',
  math: 'Mathe',
  nature: 'Natur',
  geo: 'Erdkunde',
} as const;
export type QuizTopic = keyof typeof QUIZ_TOPICS;

export interface QuizQuestion {
  id: string;
  topic: QuizTopic;
  /** Youngest age the question is for. */
  age: number;
  question: string;
  /** The FIRST answer is the right one. The game mixes the order. */
  answers: readonly [string, string, string, string];
  /** Short explanation, shown after the answer. */
  explain: string;
}

/** Short way to write a question in the topic files. */
export function q(
  topic: QuizTopic,
  id: string,
  question: string,
  answers: QuizQuestion['answers'],
  explain: string,
  age = 10,
): QuizQuestion {
  return { id: `${topic}-${id}`, topic, age, question, answers, explain };
}
