import { MISSION, MISSION_NAME, type MissionGoal } from '../../content/mission';
import { RESOURCE_IDS, RESOURCE_INFO, type ResourceAmounts } from '../../content/resources';
import { addEvent } from '../game';
import { activeBuildings } from '../stats';
import type { GameState, MissionState, PlayerState } from '../state';
import { L, fmt, joinLoc, type Loc } from '../../content/text';

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

export function rewardText(reward: ResourceAmounts): Loc {
  return joinLoc(
    RESOURCE_IDS.filter((id) => reward[id]).map((id) =>
      fmt(L('{n} {r}', '{n} {r}'), { n: reward[id] ?? 0, r: RESOURCE_INFO[id].name }),
    ),
  );
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
  addEvent(
    state,
    fmt(L('Aufgabe geschafft! Belohnung: {r}.', 'Task done! Reward: {r}.'), {
      r: rewardText(step.reward),
    }),
    'good',
  );
  if (m.step === MISSION.length)
    addEvent(
      state,
      fmt(
        L('Mission „{m}“ geschafft! Eure Kolonie lebt.', 'Mission “{m}” done! Your colony lives.'),
        { m: MISSION_NAME },
      ),
      'good',
    );
}
