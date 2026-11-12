/** Rules of online worlds (M7). Change numbers here to balance. */
export const ONLINE = {
  /** New people cannot get war from other people for this long (beginner shield). */
  shieldMs: 3 * 24 * 60 * 60_000,
  /** War on a person only if they have at least this share of your progress (strength range). */
  minStrength: 0.5,
  /** Most sides in one world (people + computers). */
  maxSides: 4,
} as const;
