# 3D model and sound credits

All models and sounds here are public domain (CC0 1.0). Crediting is not required, but we thank the authors.

## Models

- `kenney/` – Space Kit 2.0 by Kenney (https://kenney.nl/assets/space-kit), CC0 1.0.
  Includes the cargo ships, speeders (planes and war ships), hangars and turrets.
- `quaternius/` – robots, mechs, astronaut, tank and monsters (alien, crab, jelly, bee, bat, wyvern) by Quaternius
  (https://quaternius.com), CC0 1.0
  (meshopt-optimized copies from the `@netforge/asset-library-files` npm package).

Materials are replaced in code (`src/render/models/kit.ts`, `alien-materials.ts`),
so colors here may differ from the game.

## Sounds (`public/audio/`)

- Sound effects (`*.ogg`) – Kenney sound packs (Impact Sounds, Interface Sounds, Sci-fi Sounds,
  Digital Audio; https://kenney.nl), CC0 1.0, via `@netforge/asset-library-files`.
- Music `battle_theme_a.mp3` – "Battle Theme A" by cynicmusic
  (https://opengameart.org/content/battle-theme-a), CC0 1.0.
- The calm background sound is made in code (Web Audio), see `src/audio/ambient.ts`.
