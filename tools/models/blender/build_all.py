"""Builds all Blender models and writes raw GLB files.

Usage (from the repo root):
  python tools/models/blender/build_all.py            # all models
  python tools/models/blender/build_all.py dome egg   # some models
Needs the `bpy` module (pip install bpy==5.3.0, Python 3.13) or run inside Blender:
  blender -b --factory-startup -P tools/models/blender/build_all.py -- dome
Then run `bun tools/models/optimize.ts` (or `bun run models`, which does both).
"""

import importlib
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import lib  # noqa: E402

MODELS = [
    'dome', 'pod', 'spider', 'spore_ship', 'egg', 'nest',
    'h_fighter', 'h_bomber', 'h_space_fighter', 'h_transport', 'h_miner', 'h_cruiser',
    'a_miner', 'a_space_fighter', 'tunnel', 'vein',
    'pad', 'mound', 'mushroom', 'horn', 'h_turret', 'crystals',
]
OUT = os.path.join(HERE, '..', 'out')


def main(names):
    os.makedirs(OUT, exist_ok=True)
    for name in names:
        lib.reset()
        importlib.import_module(name).build()
        path = os.path.abspath(os.path.join(OUT, f'{name}.glb'))
        tris = lib.triangles()
        lib.export(path)
        print(f'{name}: {tris} triangles -> {path}')


if __name__ == '__main__':
    args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    main([a for a in args if a in MODELS] or MODELS)
