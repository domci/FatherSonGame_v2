import { handleApi, json } from './api';
import { roomOf, type Env } from './env';
import { L } from '../src/content/text';
import { allowed } from './rate';
import { SERVER_TEXT } from './texts';

export { LobbyDO } from './lobby';
export { WorldRoom } from './room';

/** Per internet address: all calls, and fewer new accounts and worlds. The address is not stored. */
async function withinLimits(req: Request, env: Env, path: string): Promise<boolean> {
  const server = path.startsWith('/api/') || path.startsWith('/ws/');
  if (!server) return true;
  const ip = req.headers.get('cf-connecting-ip') ?? 'local';
  if (!(await allowed(env.RL_IP, ip))) return false;
  const creates = req.method === 'POST' && (path === '/api/account' || path === '/api/worlds');
  return !creates || allowed(env.RL_NEW, ip);
}

function tooMany(): Response {
  return json({ error: SERVER_TEXT.busy }, 429);
}

/** The Worker: game files (static), the API for accounts and worlds, and WebSockets to the worlds. */
export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (!(await withinLimits(req, env, url.pathname))) return tooMany();
    const ws = /^\/ws\/([0-9A-Z]{12})$/.exec(url.pathname);
    if (ws?.[1]) return roomOf(env, ws[1]).fetch(req);
    if (url.pathname.startsWith('/api/')) {
      try {
        return await handleApi(req, env, url.pathname);
      } catch (e) {
        console.error('api error', e);
        return json(
          {
            error: L(
              'Server-Fehler. Bitte später noch einmal.',
              'Server error. Please try again later.',
            ),
          },
          500,
        );
      }
    }
    return env.ASSETS.fetch(req);
  },
} satisfies ExportedHandler<Env>;
