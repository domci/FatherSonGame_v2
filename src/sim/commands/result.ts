export type CommandResult = { ok: true } | { ok: false; reason: string };

export const OK: CommandResult = { ok: true };

export function fail(reason: string): CommandResult {
  return { ok: false, reason };
}
