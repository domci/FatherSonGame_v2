import { MISSION, MISSION_NAME, type MissionGoal } from '../../content/mission';
import { RESOURCE_IDS, RESOURCE_INFO, type ResourceAmounts } from '../../content/resources';
import { addEvent } from '../game';
import { activeBuildings } from '../stats';
import type { GameState, MissionState, PlayerState } from '../state';

export function newMission(): MissionState {
  return { step: 0, off: false };
}

/** Is this goal reached now? */
export function goalReached(state: GameState, player: PlayerState, goal: MissionGoal): boolean {
  switch (goal.kind) {
    case 'build':
      return activeBuildings(state, player.id).some((b) => b.building?.type === goal.building);
    case 'people':
      return player.colony.people >= goal.count;
    case 'research':
      return player.research.done.length > 0;
    case 'quiz':
      return player.quiz.right > 0;
  }
}

export function rewardText(reward: ResourceAmounts): string {
  return RESOURCE_IDS.filter((id) => reward[id])
    .map((id) => `${reward[id] ?? 0} ${RESOURCE_INFO[id].name}`)
    .join(', ');
}

/** Checks the mission of the human player. One step per call. */
export function missionSystem(state: GameState): void {
  const player = state.players.player;
  const m = player?.mission;
  if (!player || !m || m.off) return;
  const step = MISSION[m.step];
  if (!step || !goalReached(state, player, step.goal)) return;
  for (const id of RESOURCE_IDS) {
    const r = step.reward[id];
    if (r) player.resources[id] = (player.resources[id] ?? 0) + r;
  }
  m.step += 1;
  addEvent(state, `Aufgabe geschafft! Belohnung: ${rewardText(step.reward)}.`, 'good');
  if (m.step === MISSION.length)
    addEvent(state, `Mission „${MISSION_NAME}“ geschafft! Eure Kolonie lebt.`, 'good');
}
