# 3D models: tool stack and asset pipeline

How the game's own 3D models are made, and how to change or add one.
Read this before you touch `tools/models/` or `public/models/blender/`.

## Where models come from

| Source | Folder | What |
|---|---|---|
| Kenney Space Kit (CC0) | `public/models/kenney/` | hangars, turrets, ships, rocks (parts for buildings) |
| Quaternius (CC0) | `public/models/quaternius/` | animated robots, mechs, monsters |
| **Own Blender models** | `public/models/blender/` | glass dome, alien pod, spider, alien spore ship, spider eggs, spider nest |
| Code shapes | `src/render/models/parts.ts` | small simple parts (boxes, cylinders, horns, ...) |

Own models are **built by Python scripts**, not by hand in a Blender window. So Claude (or anybody) can change
them in code, review the change in git, and build them again in a cloud container without a screen.

## Tool stack

| Tool | Version | Role | Install |
|---|---|---|---|
| **Blender** as Python module `bpy` | 5.3.0 | builds the meshes (bmesh, modifiers: displace, bevel, wireframe), exports GLB | `sh tools/models/setup.sh` (pip, Python 3.13, ~430 MB) or a normal Blender 5.2+ app |
| **glTF Transform** (`@gltf-transform/*`) | 4.5.1 | dedup, weld, prune, writes the final GLB | `bun install` (devDependency) |
| **meshoptimizer** (npm) | 1.3.0 | detail levels (simplifier) and compression (`EXT_meshopt_compression`) | `bun install` (devDependency) |
| **three.js** `GLTFLoader` + `MeshoptDecoder` | 0.187 | loads the models in the game | already in the game |
| Playwright + `tools/gallery.html` | – | pictures of all models for review (before/after) | already in the repo |
| Blender Agent Skills (optional) | github.com/EL4CTEO/blender-skills (MIT) | good rules for bpy 5.x, hard-surface, LOD and export | clone it next to the repo and read `skills/blender-core/SKILL.md` |

Not used (checked 2026-11-15): Babylon.js, PlayCanvas, React Three Fiber, Drei (other engines or React),
Meshroom, Nerfstudio, Open3D (models from photos), CadQuery, Replicad, OpenUSD, Filament, MaterialX.
**Manifold** (exact solid booleans) is built into Blender 5.x as the Boolean modifier's `MANIFOLD` solver; use it
from the scripts if a model needs cut-outs (inputs must be closed meshes).

## Pipeline

```
tools/models/blender/<name>.py ──(bpy, headless)──► tools/models/out/<name>.glb   (raw, not in git)
                                                    │
tools/models/optimize.ts ──(glTF Transform + meshoptimizer)──► public/models/blender/<name>.glb  (in git)
                                                    │
src/render/models/kit.ts (loadKit) ──► lod.ts (makeLods) ──► parts.ts (blenderMaterials) ──► game
```

1. **Build** (`tools/models/blender/build_all.py`): one Python file per model with a `build()` function.
   `lib.py` has the helpers: `sphere`, `tube`, `sweep` (one smooth tube through points: veins, legs, horns),
   `chain`, `join`, `displace` (bumpy surface from noise), `bevel`, `empty` (named pivot for animation), `export`.
   Helpers take **game coordinates** (x right, y up, z front); `g()` turns them into Blender's (z up).
2. **Optimize** (`tools/models/optimize.ts`): `dedup` + `weld`, then for every mesh node `X` two simpler copies
   `X__lod1` (35 % of vertices) and `X__lod2` (12 %) as siblings, then `prune` + `meshopt` (level `high`:
   quantized, compressed). Prints triangles per level and file size.
3. **Load** (`src/render/models/kit.ts`): Blender models are in the `BLENDER` list and load with the kit.
   They keep their own pivot (no centering). `makeLods()` turns `X`, `X__lod1`, `X__lod2` into one three.js
   `LOD` object: full detail up to 26 tiles from the camera, then lod1, from 44 tiles lod2.
4. **Materials:** a Blender model names its materials like the game (`MaterialName` in `parts.ts`, for example
   `steel`, `domeGlass`, `chitin`, `glowGreen`). `blenderMaterials()` swaps in the game's real materials, so
   a Blender model looks like the rest of the game and glows the same. Special slot names are mapped where the
   model is used: `shell` on the pod (gets the pod's material), `rock` on the nest. The colors in Blender are
   only a preview.

## Commands

```sh
sh tools/models/setup.sh                      # once: Blender 5.3 as Python module in .venv-blender
bun run models                                # build + optimize all models
bun run models spider                         # only one (or more) models
bun run dev                                   # then, in a second shell:
node tools/models/shots-gallery.mjs /tmp/after.png          # picture of all main models
node tools/models/shots-ingame.mjs http://localhost:5173/ /tmp/after   # human + alien base in the game
node tools/make-thumbs.mjs                    # new build-bar pictures (when buildings look different)
```

`bun run models` uses `$BLENDER_PY` (a Python with `bpy`) if set, else `.venv-blender/bin/python`,
else a `blender` app on the PATH (`blender -b -P ...`).

## Add or change a model

1. Write `tools/models/blender/<name>.py` with `build()`. Put the name in `MODELS` in `build_all.py`
   and in `BLENDER` in `src/render/models/kit.ts`.
2. Name materials like game materials. Name pivots that the game animates (`empty('leg0', ...)`).
3. `bun run models <name>`, then look at it: add it to `tools/gallery.ts` and take a gallery picture.
4. Use it: as a kit part in a spec (`{ kit: 'pod', scale: [...], mats: { shell: 'chitin' } }`) or with
   `kitModel(name)` + `blenderMaterials()`.
5. Commit the script **and** `public/models/blender/<name>.glb` (the game does not build models itself).

## Budgets (web + tablet)

- One model: up to ~7k triangles at full detail; lod1 about 40 %, lod2 about 10–40 % (flat-shaded hard
  surfaces like the dome frame cannot shrink as much).
- One file: up to ~150 KB (GLB with meshopt; gzip on the server halves it).
- Few materials per model: join parts per material (`join()`), because each material is one draw call.
- Many copies on screen (domes, pods): watch the frame rate on the tablet; lower the LOD distances in
  `lod.ts` if needed.

## Current models (2026-11-15)

| Model | Used for | Triangles (lod0 / lod1 / lod2) | Size |
|---|---|---|---|
| `dome` | glass dome over all human living/working buildings (`glassDome()`) | 6008 / 3616 / 2752 | 145 KB |
| `pod` | every alien pod (`pod()` in `alien-helpers.ts`) | 3738 / 1546 / 440 | 40 KB |
| `spider` | spider creature, legs `leg0..leg5` swing in code | 6578 / 3004 / 820 | 80 KB |
| `spore_ship` | alien transport, cruiser (1.6×) | 3424 / 1402 / 420 | 42 KB |
| `egg` | spider eggs | 2556 / 1860 / 342 | 36 KB |
| `nest` | spider nest | 3286 / 1390 / 382 | 41 KB |

Good next candidates: human ships (now Kenney speeders), glass tunnels (`tunnel-net.ts`), alien horns and
mushrooms, the human command building.
