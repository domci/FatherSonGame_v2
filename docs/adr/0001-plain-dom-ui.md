# ADR 0001: Plain DOM for menus (no Preact for now)

Date: 2026-11-08

The plan suggested Preact for menus. We start with plain TypeScript + DOM helpers instead.

- Fewer tools and build settings to learn.
- The HUD is small. Updates run a few times per second from the game loop.
- If the UI grows a lot (alliances, chat in M7), we can move to Preact then.
