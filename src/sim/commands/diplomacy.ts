import { aiAnswer } from '../ai/answer';
import {
  addOffer,
  changeRelation,
  endAlliance,
  offerFrom,
  removeOffers,
  whyNot,
  type DiplomacyAction,
} from '../diplomacy';
import type { PlayerId, SideId } from '../entity';
import { isSide, relationOf } from '../relations';
import type { GameState, Offer } from '../state';
import { fail, OK, type CommandResult } from './result';

/** Peace, alliance or war with another side (or say no to its offer). */
export interface DiplomacyCommand {
  type: 'diplomacy';
  player: PlayerId;
  side: SideId;
  action: DiplomacyAction;
}

/** A computer side remembers who broke its word. */
function remember(state: GameState, victim: SideId, by: SideId): void {
  const ai = state.ai[victim];
  if (ai && !ai.distrust?.includes(by)) ai.distrust = [...(ai.distrust ?? []), by];
}

/** Does a computer play this side? (The player side too, in balancing runs.) */
function isComputer(state: GameState, side: SideId): boolean {
  return !!state.ai[side];
}

/** An offer is accepted at once when the other side offered the same, or the computer agrees. */
function propose(state: GameState, from: SideId, to: SideId, kind: Offer['kind']): CommandResult {
  if (offerFrom(state, to, from, kind)) {
    changeRelation(state, from, to, kind);
    return OK;
  }
  if (!isComputer(state, to)) {
    addOffer(state, from, to, kind);
    return OK;
  }
  const no = aiAnswer(state, to, from, kind);
  if (no) return fail(no);
  changeRelation(state, from, to, kind);
  return OK;
}

export function diplomacy(state: GameState, cmd: DiplomacyCommand): CommandResult {
  const from = cmd.player;
  if (!isSide(from)) return fail('Unbekannter Spieler.');
  const why = whyNot(state, from, cmd.side, cmd.action);
  if (why) return fail(why);
  switch (cmd.action) {
    case 'war':
      if (relationOf(state, from, cmd.side) === 'peace') remember(state, cmd.side, from);
      changeRelation(state, from, cmd.side, 'war');
      return OK;
    case 'endAlliance':
      remember(state, cmd.side, from);
      endAlliance(state, from, cmd.side);
      return OK;
    case 'decline':
      removeOffers(state, from, cmd.side);
      return OK;
    default:
      return propose(state, from, cmd.side, cmd.action);
  }
}
