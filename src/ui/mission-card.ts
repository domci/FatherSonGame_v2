import type { Session } from '../app/session';
import { MISSION, MISSION_NAME, type MissionGoal } from '../content/mission';
import { nameOfBuilding } from '../sim/names';
import { clear, el } from './dom';
import { costChips, icon } from './icons';

function goalTitle(session: Session, goal: MissionGoal): string {
  const s = session.state;
  switch (goal.kind) {
    case 'build':
      return `Baut: ${nameOfBuilding(s, 'player', goal.building)}`;
    case 'people':
      return `Habt ${goal.count} Bewohner (jetzt ${s.players.player?.colony.people ?? 0})`;
    case 'research':
      return 'Erforscht etwas im Labor';
    case 'quiz':
      return 'Beantwortet eine Quizfrage richtig';
  }
}

/** Small card at the top left: the current step of the first mission. */
export class MissionCard {
  readonly root = el('div', { class: 'panel mission-card' });
  private key = '';

  constructor(private session: Session) {}

  update(): void {
    const m = this.session.state.players.player?.mission;
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
          title: 'Mission ausblenden',
          onclick: () => this.session.command({ type: 'missionOff', player: 'player' }),
        },
        icon('x'),
      ),
      el(
        'div',
        { class: 'p-sub' },
        `Mission „${MISSION_NAME}“ · ${m.step + 1} von ${MISSION.length}`,
      ),
      el('div', { class: 'mission-goal' }, icon('flag'), goalTitle(this.session, step.goal)),
      el('p', { class: 'p-text muted' }, step.hint),
      el('div', { class: 'mission-reward' }, el('span', {}, 'Belohnung'), costChips(step.reward)),
    );
  }
}
