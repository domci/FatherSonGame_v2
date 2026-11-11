import type { Session } from '../app/session';
import { QUIZ_BY_ID, QUIZ_RULES, QUIZ_TOPICS, type QuizQuestion } from '../content/quiz';
import { isRight, quizStatus } from '../sim/quiz';
import { el } from './dom';
import { icon } from './icons';

const LETTERS = ['A', 'B', 'C', 'D'];

function leftText(session: Session): string {
  const quiz = session.state.players.player?.quiz;
  if (!quiz) return '';
  const left = quizStatus(quiz, session.state.time).left;
  return `Richtig = ${QUIZ_RULES.reward} Wissenskristall. Noch ${left} Fragen in dieser Stunde.`;
}

/** After the answer: colors, explanation and the buttons to go on. */
function showResult(
  box: HTMLElement,
  buttons: HTMLElement[],
  o: { q: QuizQuestion; order: number[]; choice: number; right: boolean; next: () => void },
): void {
  box.querySelector('.quiz-left')?.remove();
  buttons.forEach((b, i) => {
    (b as HTMLButtonElement).disabled = true;
    if (o.order[i] === 0) b.classList.add('right');
    else if (i === o.choice) b.classList.add('wrong');
  });
  const title = o.right ? 'Richtig! +1 Wissenskristall' : 'Leider falsch. Kurze Pause: 1 Minute.';
  box.append(
    el(
      'div',
      { class: `quiz-result ${o.right ? 'good' : 'bad'}` },
      icon(o.right ? 'check' : 'x'),
      el('b', {}, title),
    ),
    el('p', { class: 'p-text' }, o.q.explain),
    el(
      'button',
      { class: 'm-item primary', onclick: o.next },
      icon('play'),
      el('span', {}, 'Weiter'),
    ),
  );
}

function questionBox(session: Session, close: () => void): HTMLElement | null {
  const quiz = session.state.players.player?.quiz;
  const current = quiz?.current;
  const q = current && QUIZ_BY_ID.get(current.id);
  if (!quiz || !current || !q) return null;
  const box = el('div', { class: 'panel dialog quiz' });
  const buttons = current.order.map((a, i) =>
    el(
      'button',
      {
        class: 'm-item quiz-answer',
        onclick: () => {
          const right = isRight(quiz, i);
          session.command({ type: 'quizAnswer', player: 'player', choice: i });
          showResult(box, buttons, { q, order: current.order, choice: i, right, next: close });
        },
      },
      el('span', { class: 'quiz-letter' }, LETTERS[i] ?? ''),
      el('span', {}, q.answers[a] ?? ''),
    ),
  );
  box.append(
    el(
      'button',
      { class: 'icon-btn close', title: 'Später beantworten', onclick: close },
      icon('x'),
    ),
    el('div', { class: 'p-sub' }, `Wissens-Quiz · ${QUIZ_TOPICS[q.topic]}`),
    el('h2', { class: 'quiz-q' }, q.question),
    ...buttons,
    el('p', { class: 'p-text muted quiz-left' }, leftText(session)),
  );
  return box;
}

/** Opens the quiz window with a question. Shows a message instead when there is a pause. */
export function openQuiz(root: HTMLElement, session: Session): void {
  if (root.querySelector('.quiz-screen')) return;
  if (!session.command({ type: 'quizAsk', player: 'player' })) return;
  const overlay = el('div', { class: 'screen modal quiz-screen' });
  const box = questionBox(session, () => overlay.remove());
  if (!box) return;
  overlay.append(box);
  root.append(overlay);
}
