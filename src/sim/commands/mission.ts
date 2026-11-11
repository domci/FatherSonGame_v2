import type { PlayerId } from '../entity';
import { getPlayer } from '../game';
import type { GameState } from '../state';
import { OK, type CommandResult } from './result';

/** Hides the mission (the player wants to play without it). */
export interface MissionOffCommand {
  type: 'missionOff';
  player: PlayerId;
}

export function missionOff(state: GameState, cmd: MissionOffCommand): CommandResult {
  getPlayer(state, cmd.player).mission.off = true;
  return OK;
}
