# ADR 0010: own 3D models from Blender scripts

Date: 2026-11-15 · Status: accepted

## Context

Dom wants cooler, more detailed models (domes, spiders, alien buildings and ships). Kenney/Quaternius kits do not
have glass domes, six-eyed spiders or living alien ships; code shapes (spheres, tori) looked too simple.
The cloud container has no screen and no asset websites, but it can install Blender 5.3 as a Python module
(`pip install bpy`) and npm packages.

## Decision

- Own models are **Python scripts** for headless Blender (`tools/models/blender/`), one file per model.
  The GLB output is optimized with **glTF Transform + meshoptimizer** (weld, detail levels, meshopt compression)
  and committed to `public/models/blender/`.
- Detail levels: `X__lod1`/`X__lod2` siblings, made into three.js `LOD` objects at load time (`lod.ts`).
- Materials are named like the game's materials and replaced at load time, so everything keeps one look.
- First models: glass dome, alien pod, spider, spore ship, spider eggs, spider nest.
- Full how-to: `docs/models.md`.

## Consequences

- Changing a model = edit a script, `bun run models <name>`, look at the gallery picture, commit script + GLB.
- About +380 KB of models (gzip about half). Load time stays short.
- The build needs Blender (430 MB) only on the machine that builds models, not for `bun run check` or the game.
