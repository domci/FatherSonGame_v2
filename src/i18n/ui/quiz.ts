import type { Loc } from '../../content/text';

export const QUIZ = {
  quizLeft: {
    de: 'Richtig = {r} Wissenskristall. Noch {n} Fragen in dieser Stunde.',
    en: 'Right = {r} knowledge crystal. {n} more questions this hour.',
  },
  quizRight: { de: 'Richtig! +1 Wissenskristall', en: 'Right! +1 knowledge crystal' },
  quizWrong: {
    de: 'Leider falsch. Kurze Pause: 1 Minute.',
    en: 'Sorry, wrong. Short break: 1 minute.',
  },
  next: { de: 'Weiter', en: 'Next' },
  later: { de: 'Später beantworten', en: 'Answer later' },
  quizSub: { de: 'Wissens-Quiz · {t}', en: 'Knowledge quiz · {t}' },
} as const satisfies Record<string, Loc>;
