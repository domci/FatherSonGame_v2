# ADR 0004: Factions, computer enemy and fights

Date: 2026-11-09

- **One rule set, two looks.** Humans and aliens use the same buildings, units and numbers. Only names
  (`content/factions.ts`), models and colors differ. Balancing stays simple and fair.
- **The AI plays with commands only** (`sim/ai/`), like a human player and later a network player. It thinks every
  5 seconds inside `economyStep`, so it also grows while the game is closed. It follows a fixed build plan
  (`content/ai.ts`) plus urgent needs (energy, housing, storage).
- **The AI ignores the fog of war** in M3. Simpler and common in strategy games.
- **Offline fights** happen only if the player turns on „Angriffe, auch wenn keiner spielt“. Then catch-up runs live
  steps while enemy troops are in the base (max. 15 minutes) and shows a fight report instead of a replay video.
- **Win/lose:** the side that loses its main building (Kommando-Kuppel / Brutkern) loses. After that, commands are
  refused.
