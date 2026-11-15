import type { Difficulty } from '../../content/ai';
import type { SideId } from '../entity';
import { isHuman } from '../humans';
import { hostileSides } from '../relations';
import type { GameState, Offer } from '../state';
import { militaryPower } from './strength';
import { L, fmt, type Loc } from '../../content/text';

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

function peaceAnswer(state: GameState, me: SideId, other: SideId): Loc | undefined {
  if (commonThreat(state, me, other)) return undefined;
  const level = difficultyOf(state, me);
  if (isHuman(state, other) && level === 'easy') return undefined;
  if (militaryPower(state, other) >= FEAR[level] * militaryPower(state, me)) return undefined;
  return L(
    '{n} fühlt sich stark und will keinen Frieden.',
    '{n} feels strong and does not want peace.',
  );
}

function allianceAnswer(state: GameState, me: SideId, other: SideId): Loc | undefined {
  if (state.ai[me]?.distrust?.includes(other))
    return L('{n} traut euch nicht mehr.', '{n} does not trust you any more.');
  if (!commonThreat(state, me, other))
    return L('{n} sieht keinen gemeinsamen Feind.', '{n} sees no common enemy.');
  return undefined;
}

/**
 * Does the computer side `me` say yes to an offer of `other`? undefined = yes.
 * Peace: when the other is strong enough, or both have a dangerous common enemy.
 * Alliance: only against a common enemy, and never with a side that broke its word.
 */
export function aiAnswer(
  state: GameState,
  me: SideId,
  other: SideId,
  kind: Offer['kind'],
): Loc | undefined {
  const no = kind === 'peace' ? peaceAnswer(state, me, other) : allianceAnswer(state, me, other);
  return no && fmt(no, { n: state.players[me]?.name ?? me });
}
