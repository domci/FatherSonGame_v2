import { viewerOf } from '../sim/viewer';
import type { Session } from '../app/session';
import { BUILDINGS, type BuildingId } from '../content/buildings';
import { MISSION, MISSION_NAME, type MissionGoal } from '../content/mission';
import { nameOfBuilding } from '../sim/names';
import { clear, el } from './dom';
import { costChips, icon } from './icons';
import { t, tx } from '../i18n';

function goalTitle(session: Session, goal: MissionGoal): string {
  const s = session.state;
  switch (goal.kind) {
    case 'build':
      return t('goalBuild', { b: tx(nameOfBuilding(s, viewerOf(s), goal.building)) });
    case 'people':
      return t('goalPeople', { n: goal.count, now: s.players[viewerOf(s)]?.colony.people ?? 0 });
    case 'research':
      return t('goalResearch');
    case 'quiz':
      return t('goalQuiz');
  }
}

/** Puts the faction's building names into a hint: {b:lab} → "Labor" or "Denkkristall". */
function hintText(session: Session, hint: string): string {
  return hint.replace(/\{b:(\w+)\}/g, (all, id: string) =>
    id in BUILDINGS
      ? tx(nameOfBuilding(session.state, viewerOf(session.state), id as BuildingId))
      : all,
  );
}

/** Small card at the top left: the current step of the first mission. */
export class MissionCard {
  readonly root = el('div', { class: 'panel mission-card' });
  private key = '';

  constructor(private session: Session) {}

  update(): void {
    const m = this.session.state.players[viewerOf(this.session.state)]?.mission;
    const step = m && !m.off ? MISSION[m.step] : undefined;
    const key = step && m ? `${m.step}:${goalTitle(this.session, step.goal)}` : 'none';
    if (key === this.key) return;
    this.key = key;
    clear(this.root);
    this.root.hidden = !step;
    if (!step || !m) return;
    this.root.append(
      el(
        'button',
        {
          class: 'icon-btn close',
          title: t('hideMission'),
          onclick: () => this.session.command({ type: 'missionOff', player: this.session.me }),
        },
        icon('x'),
      ),
      el(
        'div',
        { class: 'p-sub' },
        t('missionStep', { m: tx(MISSION_NAME), a: m.step + 1, b: MISSION.length }),
      ),
      el('div', { class: 'mission-goal' }, icon('flag'), goalTitle(this.session, step.goal)),
      el('p', { class: 'p-text muted' }, hintText(this.session, tx(step.hint))),
      el('div', { class: 'mission-reward' }, el('span', {}, t('reward')), costChips(step.reward)),
    );
  }
}
