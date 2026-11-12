import { AI_TUNING } from '../../content/ai';
import { DIPLOMACY } from '../../content/sides';
import { applyCommand } from '../commands';
import { offerFrom, whyNot, type DiplomacyAction } from '../diplomacy';
import type { SideId } from '../entity';
import { aliveSides, hostileSides, relationOf, relationSince } from '../relations';
import type { AiState, GameState, PlayerState } from '../state';
import { commonThreat, difficultyOf } from './answer';
import { militaryPower } from './strength';

/** A side at peace this much weaker invites an attack. */
const PREY = 0.5;
/** An enemy this much stronger makes the computer ask for peace. */
const DANGER = 1.5;

function tryAction(state: GameState, me: SideId, side: SideId, action: DiplomacyAction): boolean {
  if (whyNot(state, me, side, action)) return false;
  if ((action === 'peace' || action === 'alliance') && offerFrom(state, me, side)) return false;
  return applyCommand(state, { type: 'diplomacy', player: me, side, action }).ok;
}

/** At war with two or more: asks the strongest enemy that is stronger for peace. */
function seekPeace(state: GameState, me: SideId): boolean {
  const enemies = hostileSides(state, me).filter((id) => id !== me);
  if (enemies.length < 2) return false;
  const mine = militaryPower(state, me);
  const danger = enemies
    .filter((id) => militaryPower(state, id) >= DANGER * mine)
    .sort((a, b) => militaryPower(state, b) - militaryPower(state, a))[0];
  return !!danger && tryAction(state, me, danger, 'peace');
}

/** Asks a side at peace for an alliance when both have a dangerous common enemy. */
function seekAlliance(state: GameState, me: SideId, ai: AiState): boolean {
  for (const id of aliveSides(state)) {
    if (id === me || relationOf(state, me, id) !== 'peace' || ai.distrust?.includes(id)) continue;
    if (commonThreat(state, me, id) && tryAction(state, me, id, 'alliance')) return true;
  }
  return false;
}

/** Nobody left to fight, or a weak side at peace: declares war (never on an ally). */
function seekWar(state: GameState, me: SideId): boolean {
  const mine = militaryPower(state, me);
  const calm = hostileSides(state, me).length === 0;
  const easy = difficultyOf(state, me) === 'easy';
  const targets = aliveSides(state)
    .filter((id) => id !== me && relationOf(state, me, id) === 'peace')
    .filter((id) => !(easy && id === 'player'))
    .filter((id) => calm || militaryPower(state, id) < PREY * mine)
    .sort((a, b) => militaryPower(state, a) - militaryPower(state, b));
  const quiet = (id: SideId): boolean =>
    state.time - relationSince(state, me, id) >= 2 * DIPLOMACY.warCooldownMs;
  const target = targets.find(quiet);
  return !!target && tryAction(state, me, target, 'war');
}

/**
 * The computer thinks about peace, alliances and war once a minute (from the time of the
 * first attacks on). One step at a time. After an offer to the player it waits longer.
 */
export function runDiplomacy(state: GameState, player: PlayerState, ai: AiState): void {
  if ((ai.nextTalkAt ?? 0) > state.time) return;
  ai.nextTalkAt = state.time + DIPLOMACY.thinkEveryMs;
  // The computer starts to talk when the time of attacks begins (nobody fights before).
  if (state.time < AI_TUNING[difficultyOf(state, player.id)].firstAttackMs) return;
  const me = player.id;
  const asked = state.offers.length;
  if (!seekPeace(state, me) && !seekAlliance(state, me, ai)) seekWar(state, me);
  if (state.offers.length > asked) ai.nextTalkAt = state.time + DIPLOMACY.askAgainMs;
}
