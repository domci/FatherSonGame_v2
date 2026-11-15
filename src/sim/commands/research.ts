import { RESEARCH, type ResearchId } from '../../content/research';
import { stageSeconds } from '../../content/time-curve';
import type { PlayerId } from '../entity';
import { getPlayer } from '../game';
import { activeBuildings } from '../stats';
import type { GameState } from '../state';
import { pay } from '../wallet';
import { fail, OK, type CommandResult } from './result';
import { L, fmt } from '../../content/text';

export interface ResearchCommand {
  type: 'research';
  player: PlayerId;
  research: ResearchId;
}

function labLevel(state: GameState, player: PlayerId): number {
  const labs = activeBuildings(state, player).filter((b) => b.building?.type === 'lab');
  return Math.max(0, ...labs.map((b) => b.building?.level ?? 0));
}

export function research(state: GameState, cmd: ResearchCommand): CommandResult {
  const def = RESEARCH[cmd.research];
  const player = getPlayer(state, cmd.player);
  if (player.research.done.includes(def.id))
    return fail(L('Schon erforscht.', 'Already researched.'));
  if (player.research.current)
    return fail(L('Das Labor forscht schon.', 'The lab is already researching.'));
  if (labLevel(state, cmd.player) < def.labLevel)
    return fail(fmt(L('Braucht Labor Stufe {n}.', 'Needs lab level {n}.'), { n: def.labLevel }));
  if (def.requires && !player.research.done.includes(def.requires)) {
    return fail(
      fmt(L('Braucht zuerst: {r}.', 'Needs first: {r}.'), { r: RESEARCH[def.requires].name }),
    );
  }
  if (!pay(player, def.cost)) return fail(L('Nicht genug Rohstoffe.', 'Not enough resources.'));
  player.research.current = { id: def.id, finishAt: state.time + stageSeconds(def.stage) * 1000 };
  return OK;
}
