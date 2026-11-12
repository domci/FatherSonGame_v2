/** Answer of the chat check: fine, not allowed, or the check does not work right now. */
export type Verdict = 'ok' | 'blocked' | 'unavailable';

export interface Moderator {
  check(text: string): Promise<Verdict>;
}

/** The part of the Workers AI binding that we use. */
export interface AiRunner {
  run(model: string, input: { messages: { role: string; content: string }[] }): Promise<unknown>;
}

export const GUARD_MODEL = '@cf/meta/llama-guard-3-8b';

/** Llama Guard answers "safe" or "unsafe\nS1", or an object with `safe`. */
export function readGuard(result: unknown): Verdict {
  const r = (result as { response?: unknown } | undefined)?.response;
  if (typeof r === 'string') {
    const t = r.trim().toLowerCase();
    if (t.startsWith('safe')) return 'ok';
    return t.startsWith('unsafe') ? 'blocked' : 'unavailable';
  }
  if (r && typeof r === 'object' && 'safe' in r)
    return (r as { safe: unknown }).safe === true ? 'ok' : 'blocked';
  return 'unavailable';
}

/** Checks each free text with an AI model before anybody else sees it. Fails closed. */
export function aiModerator(ai: AiRunner | undefined): Moderator {
  return {
    async check(text) {
      if (!ai) return 'unavailable';
      try {
        return readGuard(
          await ai.run(GUARD_MODEL, { messages: [{ role: 'user', content: text }] }),
        );
      } catch (e) {
        console.warn('moderation failed', e);
        return 'unavailable';
      }
    },
  };
}

/** Only for local tests (MODERATION=rules): the simple rules decide alone. */
export const rulesOnly: Moderator = { check: () => Promise.resolve('ok') };
