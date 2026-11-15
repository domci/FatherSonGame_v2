/** Rules of online worlds (M7). Change numbers here to balance. */
export const ONLINE = {
  /** New people cannot get war from other people for this long (beginner shield). */
  shieldMs: 3 * 24 * 60 * 60_000,
  /** War on a person only if they have at least this share of your progress (strength range). */
  minStrength: 0.5,
  /** Most sides when a world is made (people + computers). */
  maxSides: 4,
  /** A world grows when more people come (one new planet each), up to this many sides. */
  maxGrownSides: 12,
} as const;

/** Limits against bots and costs (server side, ADR 0012). */
export const LIMITS = {
  /** Worlds one account may make (own worlds). */
  worldsPerAccount: 5,
  /** New accounts in the whole game per hour. */
  accountsPerHour: 300,
  /** New worlds in the whole game per hour. */
  worldsPerHour: 200,
  /** Own chat texts one person may send per window (each costs an AI check). */
  textsPerWindow: 15,
  textWindowMs: 10 * 60_000,
  /** Open worlds in the lobby list (most recently played first). */
  openListed: 30,
} as const;
