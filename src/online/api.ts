import type { AccountInfo, NewWorld, WorldInfo } from '../net/protocol';

/** Your online account on this device. The key is the only "password" (no e-mail, no real name). */
export interface StoredAccount {
  id: string;
  key: string;
  name: string;
}

const KEY = 'bruchlandung:account';

export function loadAccount(): StoredAccount | undefined {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StoredAccount) : undefined;
  } catch {
    return undefined;
  }
}

export function storeAccount(a: StoredAccount | undefined): void {
  try {
    if (a) localStorage.setItem(KEY, JSON.stringify(a));
    else localStorage.removeItem(KEY);
  } catch {
    // Private mode: the account is only kept until the page closes.
  }
}

/** Device code = account id + key, in groups of 4 ("ABCD-EFGH-…"): moves the account to another device. */
export function deviceCode(a: StoredAccount): string {
  return (a.id + a.key).replace(/(.{4})(?=.)/g, '$1-');
}

export function fromDeviceCode(code: string): { id: string; key: string } | undefined {
  const flat = code.toUpperCase().replace(/[^0-9A-Z]/g, '');
  return flat.length === 24 ? { id: flat.slice(0, 8), key: flat.slice(8) } : undefined;
}

/** The server said no, or is not there (status 0). 401 = the account is gone. */
export class ApiError extends Error {
  constructor(
    text: string,
    readonly status = 0,
  ) {
    super(text);
  }
}

async function call<T>(path: string, init: RequestInit, a?: StoredAccount): Promise<T> {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (a) Object.assign(headers, { 'x-account': a.id, 'x-key': a.key });
  let res: Response;
  try {
    res = await fetch(path, { ...init, headers });
  } catch {
    throw new ApiError('Keine Verbindung zum Server.');
  }
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new ApiError(data.error ?? `Fehler ${res.status}`, res.status);
  return data;
}

export const api = {
  createAccount: (name: string) =>
    call<{ id: string; key: string }>('/api/account', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),
  me: (a: StoredAccount) => call<AccountInfo>('/api/me', { method: 'GET' }, a),
  rename: (a: StoredAccount, name: string) =>
    call<{ ok: true }>('/api/me', { method: 'PUT', body: JSON.stringify({ name }) }, a),
  deleteMe: (a: StoredAccount) => call<{ ok: true }>('/api/me', { method: 'DELETE' }, a),
  worlds: (a: StoredAccount) =>
    call<{ mine: WorldInfo[]; open: WorldInfo[] }>('/api/worlds', { method: 'GET' }, a),
  createWorld: (a: StoredAccount, w: NewWorld) =>
    call<WorldInfo>('/api/worlds', { method: 'POST', body: JSON.stringify(w) }, a),
  byCode: (a: StoredAccount, code: string) =>
    call<WorldInfo>(
      `/api/worlds/${encodeURIComponent(code.trim().toUpperCase())}`,
      { method: 'GET' },
      a,
    ),
};
