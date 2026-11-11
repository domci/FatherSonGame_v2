import { QUIZ_RULES } from '../../content/quiz';
import { HOUR } from '../clock';
import type { PlayerId } from '../entity';
import { getPlayer } from '../game';
import { formatWait, isRight, pickQuestion, quizStatus } from '../quiz';
import type { GameState } from '../state';
import { fail, OK, type CommandResult } from './result';

export interface QuizAskCommand {
  type: 'quizAsk';
  player: PlayerId;
}

export interface QuizAnswerCommand {
  type: 'quizAnswer';
  player: PlayerId;
  /** Number of the shown answer (0..3). */
  choice: number;
}

/** Opens a new question (or keeps the open one, so closing the window does not skip it). */
export function quizAsk(state: GameState, cmd: QuizAskCommand): CommandResult {
  const player = getPlayer(state, cmd.player);
  const status = quizStatus(player.quiz, state.time);
  if (player.quiz.current) return OK;
  if (status.reason === 'pause')
    return fail(`Kurze Pause nach einer falschen Antwort: noch ${formatWait(status.waitMs)}.`);
  if (status.reason === 'hour')
    return fail(`Genug Fragen für diese Stunde. Nächste Frage in ${formatWait(status.waitMs)}.`);
  pickQuestion(state, player);
  return OK;
}

/** Answers the open question: right = a knowledge crystal, wrong = a short pause. */
export function quizAnswer(state: GameState, cmd: QuizAnswerCommand): CommandResult {
  const player = getPlayer(state, cmd.player);
  const quiz = player.quiz;
  if (!quiz.current) return fail('Keine offene Frage.');
  if (isRight(quiz, cmd.choice)) {
    quiz.right += 1;
    player.resources.crystals = (player.resources.crystals ?? 0) + QUIZ_RULES.reward;
  } else {
    quiz.wrong += 1;
    quiz.pauseUntil = state.time + QUIZ_RULES.wrongPauseMs;
  }
  quiz.asked.push(quiz.current.id);
  quiz.answers = [...quiz.answers.filter((t) => t > state.time - HOUR), state.time];
  delete quiz.current;
  return OK;
}
