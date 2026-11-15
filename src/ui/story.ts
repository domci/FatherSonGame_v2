import { MISSION_NAME, STORY } from '../content/mission';
import type { Faction } from '../content/factions';
import { el } from './dom';
import { icon } from './icons';
import { t, tx } from '../i18n';

/** The story window at the start of a new game. */
export function storyIntro(faction: Faction, onClose: () => void): HTMLElement {
  const story = STORY[faction];
  const overlay = el('div', { class: 'screen modal story' });
  overlay.append(
    el(
      'div',
      { class: `panel dialog story-box ${faction}` },
      el('div', { class: 'p-sub' }, t('missionName', { m: tx(MISSION_NAME) })),
      el('h2', {}, tx(story.title)),
      ...story.lines.map((line) => el('p', { class: 'p-text' }, tx(line))),
      el(
        'button',
        {
          class: 'm-item primary',
          onclick: () => {
            overlay.remove();
            onClose();
          },
        },
        icon('play'),
        el('span', {}, t('toBase')),
      ),
    ),
  );
  return overlay;
}
