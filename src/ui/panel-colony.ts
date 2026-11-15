import { viewerOf } from '../sim/viewer';
import type { Session } from '../app/session';
import type { BuildingLevel } from '../content/buildings';
import { NEED_IDS, NEEDS_PER_PERSON } from '../content/colony';
import { RESOURCE_INFO } from '../content/resources';
import { healthy, moodParts, moodTarget, workShare } from '../sim/colony';
import { playerStats } from '../sim/stats';
import { el } from './dom';
import { RESOURCE_ICON, type IconName } from './icons';
import { header, section, stat, text } from './panel-kit';
import { t, tx } from '../i18n';

export function moodIcon(mood: number): IconName {
  if (mood >= 60) return 'smile';
  return mood >= 35 ? 'meh' : 'frown';
}

export function moodWord(mood: number): string {
  if (mood >= 80) return t('moodVeryHappy');
  if (mood >= 60) return t('moodHappy');
  if (mood >= 35) return t('moodOk');
  return t('moodSad');
}

/** What a building does for the people: room, healing, mood. */
export function colonyStats(lvl: BuildingLevel): HTMLElement[] {
  const out: HTMLElement[] = [];
  if (lvl.residents) out.push(stat('users', t('homes'), String(lvl.residents), '#9fe0b0'));
  if (lvl.heals)
    out.push(stat('heart-pulse', t('heals'), t('perMinute', { n: lvl.heals }), '#ff6b81'));
  if (lvl.mood) out.push(stat('smile', t('mood'), `+${lvl.mood}`, '#ffd25a'));
  return out;
}

const pct = (v: number): string => `${Math.round(v * 100)} %`;

/** One line per mood reason: "+10 Sauerstoff da". */
function reasons(session: Session): HTMLElement {
  const c = session.state.players[viewerOf(session.state)]?.colony;
  const list = el('div', { class: 'mood-list' });
  if (!c) return list;
  for (const p of moodParts(c, playerStats(session.state, viewerOf(session.state)))) {
    const sign = p.value > 0 ? '+' : '';
    const cls = p.value < 0 ? 'bad' : 'good';
    list.append(
      el('div', { class: `mood-row ${cls}` }, el('b', {}, `${sign}${p.value}`), tx(p.text)),
    );
  }
  return list;
}

/** What the player can do now. */
function tip(session: Session): string {
  const s = session.state;
  const c = s.players[viewerOf(s)]?.colony;
  const stats = playerStats(s, viewerOf(s));
  if (!c) return '';
  if (NEED_IDS.some((id) => c.met[id] < 1)) return t('tipNeeds');
  if (c.sick >= 1) return t('tipSick');
  if (healthy(c) < stats.jobs) return t('tipWorkers');
  if (c.people >= stats.residents) return t('tipFull');
  if (c.mood < 60) return t('tipMood');
  return t('tipOk');
}

/** The colony window: people, work, needs and why they feel like they do. */
export function colonyPanel(session: Session): HTMLElement[] {
  const s = session.state;
  const c = s.players[viewerOf(s)]?.colony;
  if (!c) return [];
  const stats = playerStats(s, viewerOf(s));
  const target = moodTarget(c, stats);
  const trend = target > c.mood + 1 ? ' ↑' : target < c.mood - 1 ? ' ↓' : '';
  const needs = NEED_IDS.map((id) => {
    const per = c.people * NEEDS_PER_PERSON[id];
    const color = c.met[id] < 1 ? '#ff6b81' : RESOURCE_INFO[id].color;
    return stat(
      RESOURCE_ICON[id],
      tx(RESOURCE_INFO[id].name),
      t('perMinute', { n: per.toFixed(1) }),
      color,
    );
  });
  return [
    header(t('yourColony'), t('residents')),
    stat('users', t('residents'), t('ofPlaces', { a: c.people, b: stats.residents })),
    stat('heart-pulse', t('sick'), String(Math.round(c.sick)), c.sick >= 1 ? '#ff6b81' : undefined),
    stat(
      'hammer',
      t('work'),
      t('workVal', {
        a: Math.min(stats.jobs, Math.round(healthy(c))),
        b: stats.jobs,
        p: pct(workShare(c, stats)),
      }),
    ),
    stat(moodIcon(c.mood), t('mood'), `${Math.round(c.mood)} – ${moodWord(c.mood)}${trend}`),
    section(t('theyNeed'), ...needs),
    section(t('moodWhy'), reasons(session)),
    text(tip(session), 'p-text muted'),
  ];
}

/** Changes when the colony window must be rebuilt. */
export function colonyKey(session: Session): string {
  const c = session.state.players[viewerOf(session.state)]?.colony;
  if (!c) return 'colony';
  const met = NEED_IDS.map((id) => (c.met[id] >= 1 ? 1 : 0)).join('');
  return `colony:${c.people}:${Math.round(c.sick)}:${Math.round(c.mood)}:${met}`;
}
