import { handleApi, json } from './api';
import { roomOf, type Env } from './env';
import { L } from '../src/content/text';

export { LobbyDO } from './lobby';
export { WorldRoom } from './room';

/** The Worker: game files (static), the API for accounts and worlds, and WebSockets to the worlds. */
export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
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
