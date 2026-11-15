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

## Best practices (learned while building the models)

**Modeling (Blender scripts)**
- Build in game coordinates with the `lib.py` helpers; `g()` does the axis swap. Ships and units face **+z**,
  turret heads aim along +z, legs/horns bend along **+x** (the code turns them).
- Author pieces at the size the game expects (pad 2 x 2, dome radius 1, tunnel 1 tile long) and the pivot where
  the game puts it (bottom center). Blender models are not re-centered at load.
- Silhouette first: a few strong shapes (`loft` hulls, `sweep` tubes) read better from the game camera than
  many tiny parts. Small detail only where the camera is close (cockpits, eyes, lamps, stripes).
- Use `sweep` (one tube through points) instead of `chain` (tubes + joint spheres): about 5x fewer triangles.
- `displace` (noise) gives organic things (chitin, flesh, rock) life for free. Keep strength small (0.01-0.03).
- Glow parts (`glow*`, `window`) are what makes a model look alive in the dark: give every model a few.
- Name parts the game moves: `leg0..leg5` (spider), `head` (turrets), `core`, `ring`, `field` (building-anim.ts).

**Materials and draw calls**
- Name Blender materials like game materials (`MaterialName`), or a slot name the code maps (`shell`, `glow`,
  `rock`, `crystal`). Never rely on Blender colors: the game swaps every material.
- `join()` parts per material group at the end (hull, paint, metal, canopy, glow). Each material in a mesh is
  one draw call; 4-6 per model is fine.
- Repeated pieces (tunnels) share one material per name (`tunnel-net.ts`, `mat()`), not a new one per copy.
- Glass (`domeGlass`, `glass`) does not cast shadows (`blenderMaterials` and the tunnel code turn it off).

**Optimizing**
- Apply modifiers before joining (`join()` does it): else the first object's modifier runs on the whole mesh.
- Watch the triangle count after each change (`build_all.py` prints it, `optimize.ts` prints all LOD levels).
  Typical: ship 600-2.3k, building part 400-2.3k, creature 6.5k, dome 6k.
- Sphere segments by size: lamps/bolts 5-8, eyes 10-14, bodies 16-28. Cylinders: thin 4-6, medium 8-12.
- Flat-shaded parts (frames, plates) split every vertex and simplify badly; prefer smooth shading with
  `set_sharp_from_angle` (the `loft` helper does it).
- LOD distances (`lod.ts`): 26 / 44 tiles. The surface camera is 6-42 tiles away, so far views use lod1/lod2.
- `meshopt` level `high` quantizes positions/normals: ~60 % smaller files, no visible loss at game size.
- Check the model in the gallery from the game's camera angle, not only from the side.

**Workflow**
- One model per file with `build()`; reuse helpers, do not copy code.
- Before/after: start the old version in a git worktree on port 5174, copy `tools/gallery.*` into it, and take the
  same gallery picture there (`shots-gallery.mjs`, with the port changed).
- Commit the script and the GLB together; rebuild thumbnails (`make-thumbs.mjs`) when buildings change.

## Current models (2026-11-15)

| Model | Used for |
|---|---|
| `dome` | glass dome over human living/working buildings (`glassDome()`) |
| `pad` | landing pad under every human building (`pad()`) |
| `h_turret` | turning gun head of human defense buildings |
| `tunnel` | glass tunnel piece (repeated, `tunnel-net.ts`) |
| `h_fighter`, `h_bomber`, `h_space_fighter`, `h_transport`, `h_miner`, `h_cruiser` | human ships |
| `pod` | every alien pod (`pod()`) |
| `mound` | living ground under every alien building (`mound()`) |
| `horn`, `mushroom` | alien horns and glowing mushrooms (`horns()`, `mushroom()`) |
| `vein` | alien living vein between buildings (repeated) |
| `spore_ship`, `a_miner`, `a_space_fighter` | alien ships (cruiser = spore ship 1.6x) |
| `spider`, `egg`, `nest` | spider creatures |
| `crystals` | diamond deposits on the ground |

Triangles and sizes: run `bun run models` (it prints them). All 26 models together: about 0.9 MB (gzip ~half).

Still from kits (good next candidates): animated units (Quaternius: drone, hunter, infantry, tank, flak mech,
alien creatures; they need rigs and animations in Blender), Kenney building parts (hangars, dishes, rockets,
structures), turret_double, terrain rocks, alien special buildings made of code shapes (solar leaves, hangar).
