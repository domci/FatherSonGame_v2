/** Rules for the people in the domes (M5). Change numbers here to balance the game. */

/** People at the start of a game (the crew of the crashed ship). */
export const START_PEOPLE = 8;
/** People never go below this, so a base can always recover. */
export const MIN_PEOPLE = 2;
/** Mood at the start of a game. */
export const START_MOOD = 70;

/** What each person uses per minute. */
export const NEEDS_PER_PERSON = { oxygen: 0.2, water: 0.15, food: 0.15 } as const;
export type NeedId = keyof typeof NEEDS_PER_PERSON;
export const NEED_IDS: readonly NeedId[] = ['oxygen', 'water', 'food'];

/** Workers for each building that produces something (mining, processing, food). */
export const WORKERS_PER_BUILDING = 2;
/** Share of production that runs without workers (robots and machines). */
export const ROBOT_SHARE = 0.25;

/** Mood points (0..100). The mood moves slowly towards the sum of these. */
export const MOOD = {
  base: 50,
  /** For each need that is fully there. */
  needMet: 10,
  /** For each need that is missing completely (part missing = part of it). */
  needMissing: -25,
  /** More people than places to live. */
  crowded: -20,
  /** No energy at all (part of it for some energy). */
  noEnergy: -15,
  /** Everybody sick (part of it for some sick people). */
  sick: -15,
  /** At most this much from parks. */
  parksMax: 20,
} as const;
/** Share of the gap between mood and target that closes per minute. */
export const MOOD_SPEED = 0.3;
/** Below this mood, people work slower. */
export const WORK_MOOD = 50;

/** New people come when the mood is at least this and there is room. */
export const GROW_MOOD = 60;
/** New people per minute at mood 100 (more people = a bit faster). */
export const GROWTH_PER_MINUTE = 0.5;
/** People leave when the mood is below this. */
export const LEAVE_MOOD = 30;
/** People who leave per minute at mood 0, or when there is no room. */
export const LEAVE_PER_MINUTE = 0.4;

/** Share of healthy people who get sick per minute when a need is missing completely. */
export const SICK_PER_MINUTE = 0.15;
/** Share of sick people who get well per minute when nothing is missing. */
export const HEAL_PER_MINUTE = 0.1;
