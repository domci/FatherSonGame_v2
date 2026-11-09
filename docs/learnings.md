# Lerntagebuch / Learnings

Short notes when something went wrong or was surprising. Newest on top.

- 2026-11-09: "Zum Hauptmenü" did not stop the old game: its loop and its autosave timer kept running and could
  overwrite the save of the next game. Every game start now returns stop functions (loop, autosave, sound, listeners).
- 2026-11-09: Miniplex `world.addComponent` does nothing if the entity already has the component. A second move order
  was ignored. Change the existing object (`Object.assign(e.mover, …)`) instead.
- 2026-11-09: The AI waited forever for diamonds it could never get. Rule: wait only for resources that have income,
  else skip the step.
- 2026-11-09: AI vs AI ran 60 s per game. Cause: `findEntity` was a linear search and every idle fighter scanned all
  entities every tick. Fix: id index (world add/remove events), targets grouped by zone once per step, idle scan
  every 300 ms. Now ~10 s per game.
- 2026-11-09: TSL `positionNode` (breathing surface) breaks skinned, animated models. Use the "skin" materials
  without `positionNode` for animated units.
- 2026-11-09: One transport (10 places) capped every AI attack; mirrored AIs never won. The AI now fills all docked
  transports.
- 2026-11-09 (playtest): An AI that follows its plan at full speed beats a child every time. Level matching works
  better than fixed timers: the computer may only grow to `lead × player progress + bonus`, and its army and attack
  waves are a share of the player's strength. A balancing run against a "slow" stand-in player (thinks every 15 s)
  shows the effect per difficulty.
- 2026-11-09: Two vitest problems on a busy machine: timing tests and long AI tests hit the 5 s default timeout.
  `testTimeout: 30_000` in vitest.config.ts; timing limits stay generous.
- 2026-11-09: Seamless zoom = one zoom value for all levels. Surface and space are two scenes; around the handoff
  both are rendered and mixed in one `RenderPipeline` (two `pass()` nodes + `mix`). Matching colors (regolith on the
  planet sphere), a light landing disc and top-down camera make the mix look like one picture.
- 2026-11-09: A camera 0.05 planet radii above the ground needs a tiny near plane; set `camera.near` from the height.
- 2026-11-09: Planets turn with their orbit (tidally locked), so the base always has morning light like the surface.

- 2026-11-08: A* bug: diagonal neighbours wrapped around the map edge (x = -1 became the previous row). Always check x and y bounds separately, never only the flat index.
- 2026-11-08: typescript-eslint 8.72 supports TypeScript only up to 6.0. TypeScript 7 is not used yet.
- 2026-11-08: `structuredClone` is a DOM/Node API, not plain ES2022. The sim uses a JSON clone instead.

## 2026-11-08 – Design-Runde nach erstem Selbst-Test

- Im Cloud-Container rendert Chromium ohne GPU (Software). Ein ganzer Playtest-Lauf dauert dann ~5 Minuten. Für schnelle Blicke lieber einzelne Screenshots.
- `Sprite` in einer Gruppe, die per Raycaster gepickt wird, braucht `raycaster.camera`. Für reine Text-Labels `sprite.raycast = () => undefined` setzen.
- Spielende brauchen sichtbares Feedback: Bau-, Trainings- und Lebens-Balken als HTML über dem 3D-Bild (`src/ui/bars.ts`) sind billig und gut lesbar.

## 2026-11-08 – Profi-Look (Modelle und UI)

- Asset-Seiten sind im Container gesperrt. Freie CC0-Kits gibt es aber als npm-Pakete (z. B. Kenney Space Kit Mirror,
  `@netforge/asset-library-files` mit Quaternius-Modellen). Herkunft und Lizenz im Paket prüfen (NOTICE).
- Kenney-Modelle sind "unlit" und liegen nicht im Ursprung. Beim Laden zentrieren und Materialien ersetzen.
- Sterne, Planeten und Sonne im Himmel brauchen `material.fog = false`, sonst färbt der Nebel sie schwarz.
- Vite lädt bei neuen Abhängigkeiten die Seite neu: in Playwright erst `networkidle` abwarten, dann auswerten.
- Playwright `mouse.wheel` wartet auf ein Bild. Mit Software-Rendering wenige große Schritte nutzen, nicht viele
  kleine. Nach einem Klick auf einen Knopf die Maus wieder über die Zeichenfläche bewegen, sonst geht das Rad an den Knopf.
