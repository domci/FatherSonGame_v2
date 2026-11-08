import { RESEARCH, type ResearchId } from '../../content/research';
import { stageSeconds } from '../../content/time-curve';
import type { PlayerId } from '../entity';
import { getPlayer } from '../game';
import { activeBuildings } from '../stats';
import type { GameState } from '../state';
import { pay } from '../wallet';
import { fail, OK, type CommandResult } from './result';

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
  if (player.research.done.includes(def.id)) return fail('Schon erforscht.');
  if (player.research.current) return fail('Das Labor forscht schon.');
  if (labLevel(state, cmd.player) < def.labLevel)
    return fail(`Braucht Labor Stufe ${def.labLevel}.`);
  if (def.requires && !player.research.done.includes(def.requires)) {
    return fail(`Braucht zuerst: ${RESEARCH[def.requires].name}.`);
  }
  if (!pay(player, def.cost)) return fail('Nicht genug Rohstoffe.');
  player.research.current = { id: def.id, finishAt: state.time + stageSeconds(def.stage) * 1000 };
  return OK;
}
