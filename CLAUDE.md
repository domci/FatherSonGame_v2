# CLAUDE.md

Rules for Claude Code (and every other agent) working on this repo.
The full plan is in `docs/plan/`. Read `docs/plan/05-arbeitsweise.md` and `docs/learnings.md` first.

## Project

- Real-time space strategy game for the browser (PC + tablet), for kids 10+.
- Father-son project. Claude builds autonomously. Ask Dom only for design questions or hard blockers.
- Talk to Dom in short, simple German. Code, comments and commits in English.

## Commands

- `bun run dev` – start dev server (http://localhost:5173)
- `bun run check` – typecheck + lint + tests + build (run before every push)
- `bun run test` / `bun run coverage` – unit tests (Vitest)
- `bun run e2e` – browser tests with screenshots (Playwright)

## Architecture (see docs/plan/03-architektur.md)

- `src/sim/` – game rules. Pure TypeScript. **No three, no DOM.** Checked by `tsconfig.sim.json` and ESLint.
- `src/content/` – game data tables (buildings, units, research, times). Balance here, not in code.
- `src/render/` – Three.js (WebGPU renderer). Only reads state.
- `src/ui/` – HTML menus. Reads state, sends commands.
- `src/input/` – mouse/touch → commands or camera.
- `src/platform/` – storage (IndexedDB).
- Every player action is a `Command` (`src/sim/commands`). The AI uses commands too.
- Timers use game time stamps (`finishAt`), so offline catch-up works.

## Hard rules (enforced by tools)

- No `any`, no lint-disable comments, no `--no-verify`.
- File ≤ 200 lines, function ≤ 40 lines, complexity ≤ 12.
- Every rule in `src/sim/` gets a test. Coverage ≥ 80 %.
- Until end of M3: commit directly to `main`, only with `bun run check` green. From M4: PRs, merge when CI is green.
- Write surprising lessons to `docs/learnings.md`. Write bigger decisions to `docs/adr/`.
