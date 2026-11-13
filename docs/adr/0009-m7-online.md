# ADR 0009: M7 – online

Date: 2026-11-13

Up to 4 peoples in one lasting world on a server: people and computers. The world runs on while nobody plays.
Friends join with a 6-letter code. Chat is checked before others see it.

## Hosting: Cloudflare, not Colyseus (Dom chose it on 2026-11-12)

- One Worker serves the page (`dist`, static assets) and the API (`server/worker.ts`, `server/api.ts`).
- Durable Objects: `LobbyDO` (one for the game: accounts, worlds, reports) and `WorldRoom` (one per world).
  Both keep their data in their own SQLite storage. Production: EU jurisdiction (`server/env.ts`).
- Chat check with Workers AI (Llama Guard 3). Free for a family; no own server to look after.
- Old plan (Colyseus on Fly.io) would cost money each month and needs a card. The game logic is plain TypeScript,
  so a move later is possible: only `server/{worker,api,lobby,room}.ts` know Cloudflare.

## Server runs the game, browsers replay it ("lockstep", `server/room-core.ts`, `src/net/lockstep.ts`)

- The world room runs the same `tick()` as offline, in real time (100 ms per step), while somebody is connected.
  Nobody there: an alarm every 6 hours catches up the time (short starts later); after 30 days without visits it sleeps.
- Browsers send commands. The server checks the type (no server-only commands like `join`), forces the
  `player` field to the seat of that browser, limits to 20 per second, and applies them before the next step.
- Every 2 steps the server sends `{to, cmds: [[step, cmd]]}`. Browsers run the same steps with the same commands.
  Every 50 steps it sends a fingerprint (`src/net/digest.ts`); a browser that differs asks for a fresh snapshot
  (at most every 5 s). A join or a resync sends a snapshot to all; the server loads its own snapshot too, so the
  inner order is the same everywhere.
- Commands online return "ok" at once; a failed own command comes back as a message (same text as offline).
- A slow device or hidden tab falls behind; it jumps forward (up to 200 steps per step), keeping 2 steps as cushion.
- Old page, new server: the build id (`VITE_BUILD` / `BUILD`) differs → the server says "reload".

## Rules for many people (`src/sim/online.ts`, `src/sim/humans.ts`)

- Seats: `player` = maker of the world, then the computers, then free seats for people.
- People start in peace with each other. Beginner shield 3 days: no war on them. War on a person only if they are
  at least half as strong as you. Who declares war on a person loses the own shield.
- Offers between people wait 24 hours. A beaten person starts again on the same planet ("Neu anfangen").
  Online worlds have no winner. Computers do not attack people who are away (unless "Angriffe, auch wenn keiner
  spielt" is on).
- Messages (`events`) can be for one side (`to`); each browser shows only its own.
- Only the maker (`player`) can change level and offline attacks.

## Accounts without real data (`server/lobby-core.ts`, `src/online/api.ts`)

- Name only from word lists ("Roter Falke 7"), no free text. No e-mail, no password.
- Account = 8-character id + 16-character secret key; the server keeps only the SHA-256 of the key.
  The browser keeps id, key and name in `localStorage`. Device code (24 characters) moves the account.
- "Konto löschen" removes the account and frees its seats at once.

## Chat (`server/room-chat.ts`, `server/chat-rules.ts`, `server/moderation.ts`)

- To all, to allies, or to one person. 10 ready-made messages are always allowed.
- Own text: max 160 letters, one message per 2 s. First simple rules (bad words, numbers, links, e-mail,
  meeting outside), then the AI check. If the check does not answer, the message is not shown (fail closed).
- Bad message: warning → 1 hour pause → 1 day → 7 days → out. Lines are kept 7 days (max 100 per world).
- "Melden" stores the line for the parents' page (`#eltern`, password = secret `ADMIN_KEY`): close, warn, ban.

## Privacy page (`#datenschutz`)

- Says in kid words what is kept, what never, where (Cloudflare, game data in the EU), and how to delete.

## Not done (later)

- Teams with more than 2 people per alliance chat channel, invites by name, matchmaking by level.
- A real legal notice (Impressum) if the game is opened to people outside family and friends.
