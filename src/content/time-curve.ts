/**
 * Build and research times grow with the stage (like Clash of Clans):
 * fast at the start (seconds), very slow later (days).
 * stage = building tier + level - 1.
 */
const STAGE_SECONDS = [
  20, // stage 1: 20 seconds
  3 * 60, // stage 2: 3 minutes
  20 * 60, // stage 3: 20 minutes
  2 * 3600, // stage 4: 2 hours
  9 * 3600, // stage 5: 9 hours
  36 * 3600, // stage 6: 1.5 days
  72 * 3600, // stage 7: 3 days
] as const;

export function stageSeconds(stage: number): number {
  const index = Math.min(Math.max(stage, 1), STAGE_SECONDS.length) - 1;
  return STAGE_SECONDS[index] ?? STAGE_SECONDS[0];
}
