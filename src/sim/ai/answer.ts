import type { Difficulty } from '../../content/ai';
import type { SideId } from '../entity';
import { isHuman } from '../humans';
import { hostileSides } from '../relations';
import type { GameState, Offer } from '../state';
import { militaryPower } from './strength';

/** How much stronger the other side must be before the computer wants peace, by level. */
const FEAR: Record<Difficulty, number> = { easy: 0, normal: 0.8, hard: 1.2 };

export function difficultyOf(state: GameState, side: SideId): Difficulty {
  return state.ai[side]?.difficulty ?? state.settings.difficulty;
}

/**
 * Strongest side at war with both, if it is a danger for `me` (at least as strong).
 * On easy, computers never team up against a person.
 */
export function commonThreat(state: GameState, me: SideId, other: SideId): SideId | undefined {
  const mine = militaryPower(state, me);
  const theirs = hostileSides(state, other);
  const easy = difficultyOf(state, me) === 'easy' && !isHuman(state, me) && !isHuman(state, other);
  return hostileSides(state, me)
    .filter((id) => id !== other && theirs.includes(id) && !(easy && isHuman(state, id)))
    .filter((id) => militaryPower(state, id) >= mine)
    .sort((a, b) => militaryPower(state, b) - militaryPower(state, a))[0];
}

function peaceAnswer(state: GameState, me: SideId, other: SideId): string {
  if (commonThreat(state, me, other)) return '';
  const level = difficultyOf(state, me);
  if (isHuman(state, other) && level === 'easy') return '';
  if (militaryPower(state, other) >= FEAR[level] * militaryPower(state, me)) return '';
  return 'fühlt sich stark und will keinen Frieden.';
}

function allianceAnswer(state: GameState, me: SideId, other: SideId): string {
  if (state.ai[me]?.distrust?.includes(other)) return 'traut euch nicht mehr.';
  if (!commonThreat(state, me, other)) return 'sieht keinen gemeinsamen Feind.';
  return '';
}

/**
 * Does the computer side `me` say yes to an offer of `other`? Empty text = yes.
 * Peace: when the other is strong enough, or both have a dangerous common enemy.
 * Alliance: only against a common enemy, and never with a side that broke its word.
 */
export function aiAnswer(state: GameState, me: SideId, other: SideId, kind: Offer['kind']): string {
  const no = kind === 'peace' ? peaceAnswer(state, me, other) : allianceAnswer(state, me, other);
  return no ? `${state.players[me]?.name ?? me} ${no}` : '';
}
