import type { Loc } from '../../content/text';
export type CommandResult = { ok: true } | { ok: false; reason: Loc };

export const OK: CommandResult = { ok: true };

export function fail(reason: Loc): CommandResult {
  return { ok: false, reason };
}
