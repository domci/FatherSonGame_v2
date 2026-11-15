import {
  MOOD,
  NEED_IDS,
  ROBOT_SHARE,
  START_MOOD,
  START_PEOPLE,
  WORK_MOOD,
} from '../content/colony';
import type { PlayerStats } from './stats';
import type { ColonyState } from './state';
import { L, fmt, type Loc } from '../content/text';

export function newColony(): ColonyState {
  return {
    people: START_PEOPLE,
    sick: 0,
    mood: START_MOOD,
    grow: 0,
    leave: 0,
    met: { oxygen: 1, water: 1, food: 1 },
    warned: [],
  };
}

export function healthy(c: ColonyState): number {
  return Math.max(0, c.people - c.sick);
}

/** 0..1: how much of the work in the buildings gets done by people. */
export function workShare(c: ColonyState, stats: PlayerStats): number {
  const labor = stats.jobs > 0 ? Math.min(1, healthy(c) / stats.jobs) : 1;
  const mood = c.mood >= WORK_MOOD ? 1 : 0.6 + (0.4 * c.mood) / WORK_MOOD;
  return labor * mood;
}

/** Production speed from the people: robots do a part, people the rest. */
export function workFactor(c: ColonyState, stats: PlayerStats): number {
  return ROBOT_SHARE + (1 - ROBOT_SHARE) * workShare(c, stats);
}

export interface MoodPart {
  /** Short reason for the colony window. */
  text: Loc;
  value: number;
}

const NEED_NAMES = {
  oxygen: L('Sauerstoff', 'Oxygen'),
  water: L('Wasser', 'Water'),
  food: L('Nahrung', 'Food'),
} as const;

/** Why the people feel like they do. The mood moves slowly to the sum. */
export function moodParts(c: ColonyState, stats: PlayerStats): MoodPart[] {
  const parts: MoodPart[] = [{ text: L('Grundlaune', 'Base mood'), value: MOOD.base }];
  for (const id of NEED_IDS) {
    const met = c.met[id];
    const value = met >= 1 ? MOOD.needMet : MOOD.needMissing * (1 - met);
    const what = met >= 1 ? L('{n} da', '{n} there') : L('{n} fehlt', '{n} missing');
    parts.push({ text: fmt(what, { n: NEED_NAMES[id] }), value });
  }
  if (c.people > stats.residents)
    parts.push({ text: L('Zu eng', 'Too crowded'), value: MOOD.crowded });
  if (stats.efficiency < 1)
    parts.push({
      text: L('Zu wenig Energie', 'Too little energy'),
      value: MOOD.noEnergy * (1 - stats.efficiency),
    });
  if (c.sick > 0 && c.people > 0)
    parts.push({ text: L('Kranke', 'Sick people'), value: (MOOD.sick * c.sick) / c.people });
  if (stats.parks > 0)
    parts.push({
      text: L('Parks', 'Parks'),
      value: Math.min(MOOD.parksMax, stats.parks * stats.efficiency),
    });
  return parts.map((p) => ({ ...p, value: Math.round(p.value) }));
}

export function moodTarget(c: ColonyState, stats: PlayerStats): number {
  const sum = moodParts(c, stats).reduce((s, p) => s + p.value, 0);
  return Math.max(0, Math.min(100, sum));
}
