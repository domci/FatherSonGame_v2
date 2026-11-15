import { viewerHome, viewerOf } from '../sim/viewer';
import type { Session } from '../app/session';
import { isFighter } from '../sim/ai/queries';
import { findBody } from '../sim/generation/solar-system';
import { el } from './dom';
import { icon, type IconName } from './icons';
import { t } from '../i18n';

/** Own fighting units on the surface the player looks at. */
export function armyOf(session: Session): number[] {
  return session.state.world
    .with('unit', 'position')
    .entities.filter((u) => u.owner === session.me && u.zone === session.ui.zone && isFighter(u))
    .map((u) => u.id);
}

/** Planets other than home where the player has troops right now. */
function frontZone(session: Session): string | undefined {
  const home = viewerHome(session.state);
  for (const e of session.state.world.with('unit', 'position'))
    if (
      e.owner === viewerOf(session.state) &&
      e.zone &&
      e.zone !== home &&
      session.state.surfaces[e.zone]
    )
      return e.zone;
  return undefined;
}

function button(ico: IconName, label: string, title: string, onclick: () => void): HTMLElement {
  return el('button', { class: 'army-btn', title, onclick }, icon(ico), el('span', {}, label));
}

/** Left side buttons: select the army, draw a box, jump to the front and back. */
export class ArmyBar {
  readonly root = el('div', { class: 'panel army-bar' });
  private box: HTMLElement;
  private front: HTMLElement;
  private frontLabel = el('span', {}, t('front'));

  constructor(private session: Session) {
    const army = button('swords', t('army'), t('armyHelp'), () => this.selectArmy());
    this.box = button('square-dashed-mouse-pointer', t('box'), t('boxHelp'), () => {
      session.ui.boxMode = !session.ui.boxMode;
    });
    this.front = el(
      'button',
      {
        class: 'army-btn',
        title: t('frontHelp'),
        onclick: () => this.toggleFront(),
      },
      icon('flag'),
      this.frontLabel,
    );
    this.root.append(army, this.box, this.front);
  }

  update(): void {
    const s = this.session;
    this.root.hidden = s.ui.view !== 'surface';
    this.box.classList.toggle('on', !!s.ui.boxMode);
    const home = viewerHome(s.state);
    const away = s.ui.zone !== home;
    this.front.hidden = !away && !frontZone(s);
    this.frontLabel.textContent = away ? t('viewBase') : t('front');
    this.front.title = away
      ? t('backToBase')
      : t('toFront', { p: findBody(s.state.system, frontZone(s) ?? '')?.name ?? '' });
  }

  private selectArmy(): void {
    const ids = armyOf(this.session);
    if (ids.length === 0) this.session.onMessage(t('noArmy'), 'info');
    this.session.select(ids);
  }

  private toggleFront(): void {
    const s = this.session;
    const home = viewerHome(s.state);
    s.goZone(s.ui.zone !== home ? home : (frontZone(s) ?? home));
  }
}
