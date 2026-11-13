# Lerntagebuch / Learnings

Short notes when something went wrong or was surprising. Newest on top.

- 2026-11-12: The AI stopped training when its home army had `defenders + waveSize` housing, but the attack picks
  whole units. With only tanks (3 housing) free, a wave of 5 never filled and the AI waited forever (1 wave in 8 h).
  When two checks must agree (train enough / attack now), let one call the other's picker.
- 2026-11-12: Strength rules on tiny numbers flip at random. At the start every side has only its dome, so
  "the other is at least as strong" was true for everybody and all computers made peace in minute 16.
  AI diplomacy now starts only at its first attack time, and "danger" means 1.5 × stronger.
- 2026-11-12: "Not mine = enemy" was in ~20 places (targeting, guard, AI, blockade, space, music, UI).
  One `hostile(state, a, b)` helper and an explore agent's list of every place made the switch to relations safe.

- 2026-11-11: In CI (software rendering, two workers) a click in the quiz window and the tablet screenshot timed out.
  An endless CSS glow animation and a full-screen `backdrop-filter` blur over the moving 3D picture cost a repaint
  each frame. Use static highlights and no blur behind big windows over the canvas.
- 2026-11-11: A test helper made the AI player with `{ ...player }`. The shallow copy shared the `colony` object,
  so both sides ate from the same colony. Build test players with `makePlayer`, never by spreading another player.
- 2026-11-11: Population needs a brake for the computer. "Build room when full" alone grew its colony to 160+ people
  until water ran out. Now it builds room only when it is short of workers.
- 2026-11-11: Every new HUD item can wrap the top bar to two lines on 1280 px, and then it covers the panels below.
  Check a screenshot after adding items; people and mood share one item (face icon = mood).
- 2026-11-11: Flat Kenney craft scaled by height were 3–4 tiles long, bigger than buildings. Flat models are now
  fitted by their longest side on the ground (`UnitLook.length`).
- 2026-11-11: War ships that each flew at their own speed arrived one by one, and the fast ones died alone. Ships
  that start together now fly at the speed of the slowest one.
- 2026-11-11: War ships have no `position`, only an `orbit` component. All surface systems query `position`, so they
  skip war ships by themselves; no extra checks needed.
- 2026-11-11: In a browser test, a zoom level change clears the selection (also the selected planet). Change the
  zoom first, then select.
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

## 2026-11-13 – M7 Online (Cloudflare)

- `wrangler dev` (workerd) kennt keine Jurisdiction für Durable Objects: lokal `EU: "off"` (`wrangler.local.jsonc`).
- Ein Workers-AI-Binding braucht auch in `wrangler dev` eine Cloudflare-Anmeldung. Lokal und in CI darum ohne AI
  (`MODERATION: "rules"`).
- Lockstep: Der Server muss nach jedem Snapshot seinen eigenen Stand auch aus dem Snapshot laden. Sonst ist die
  innere Reihenfolge (Archetypen) anders als im Browser, und die Fingerabdrücke passen nicht.
- Zwei Spiele im selben Headless-Chromium mit Software-Grafik sind langsam: Die Browser fallen Sekunden hinter den
  Server zurück. Darum springt der Browser bei Rückstand weit vor (nicht nur ein Viertel pro Schritt). Im e2e kleine
  Fenster nutzen.
- Eine Sitzung sieht neue Variablen einer Cloud-Umgebung erst, wenn sie neu startet (neuer Thread).
- Eine lokale Ausnahme in `.git/info/exclude` (`viewer.ts`) hat `src/sim/viewer.ts` aus dem Commit gehalten. Lokal war
  alles grün, CI rot. Vor dem Push: `git status --ignored` ansehen, oder in einem frischen `git worktree` prüfen.
