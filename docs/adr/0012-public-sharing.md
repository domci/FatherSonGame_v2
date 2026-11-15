# ADR 0012: Share the game in public (X, strangers)

Date: 2026-11-15

Dom wants to share crashlanded.dom-builds.com on x.com. Strangers and kids (10+) then meet online.

## Legal

- Impressum and the operator's privacy page are on dom-builds.com (`src/content/legal.ts`).
  The start screen, the online name picker, the lobby and the game privacy page (`#datenschutz`) link them.
- dom-builds.com/datenschutz says: subdomain projects have their own notice. The game notice is `#datenschutz`:
  kid words first, then a GDPR part (`src/i18n/privacy-legal.ts`: controller via Impressum, legal bases,
  Cloudflare as processor, Workers AI may run outside the EU and gets only the text, rights, authority).
- Contact data is not copied into the game; the Impressum is the one place for it.

## Chat with strangers

- Open worlds (in the list for everyone): only ready-made messages. The server refuses own text
  (`RoomChat.quickOnly`, set from `WorldRecord.open`, which never changes). The chat window hides the input.
- Worlds shared by link or code: own text as before (word rules + AI check, fail closed).

## Limits against bots and costs

- Worker, per IP (Cloudflare rate limit bindings in `wrangler.jsonc`, counted per location, IP not stored):
  `RL_IP` 300 API calls/world connections per minute, `RL_NEW` 10 new accounts or worlds per minute.
- Lobby (in memory, `server/rate.ts`): 300 new accounts and 200 new worlds per hour in the whole game,
  at most 5 own worlds per account (`LIMITS` in `src/content/online.ts`).
- Chat: 15 own texts per person per 10 minutes (each costs an AI check); `RL_AI` 200 AI checks per minute
  for the whole game. Over the limit the check says "unavailable" (no text is shown, quick messages work).
- Local `wrangler.local.jsonc` has no rate limit bindings (the load test runs from one address).
- A hard spending cap does not exist for Workers Paid. Dom sets budget alerts in the Cloudflare dashboard.

## Load (tools/loadtest.ts, local wrangler dev, 4 CPUs, all objects in one process)

- 240 players in 60 worlds, 60 s: all steps in real time (step share 1.0), ping p50 10 ms / p95 42 ms,
  0 errors. 50 parallel lobby calls: p50 ~170 ms.
- On Cloudflare each world is its own Durable Object, so worlds do not slow each other down.
  The one lobby object is the shared part; its world list is now kept in memory (`server/world-index.ts`),
  and the open list shows only the 30 most recently played worlds.

## Link preview

- Open Graph + Twitter card in `index.html`, image `public/og.jpg` (1200×630, start screen without buttons).

## Visitor statistics (Dom, 2026-11-15)

- onedollarstats (`src/platform/stats.ts`): the script is added only on crashlanded.dom-builds.com, so local runs
  and tests send nothing. No hash routing (world codes in `#welt=` stay out of the stats).
- Events: Game start/continue, Online open, World link opened, Account created, World created/joined,
  Invite shown, First action (once per command type and page load), Victory/Defeat, Language, Privacy page.
  Props are fixed words and small numbers only: never names, chat text, codes or ids.
