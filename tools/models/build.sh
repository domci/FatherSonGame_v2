#!/bin/sh
# Builds all Blender models and optimizes them for the game.
# Usage: bun run models [name ...]     e.g. bun run models spider
# Uses $BLENDER_PY (a Python with bpy), else .venv-blender, else `blender -b`.
set -e
PY="${BLENDER_PY:-.venv-blender/bin/python}"
if [ -x "$PY" ]; then
  "$PY" tools/models/blender/build_all.py "$@"
elif command -v blender >/dev/null 2>&1; then
  blender -b --factory-startup --python-exit-code 1 -P tools/models/blender/build_all.py -- "$@"
else
  echo "No Blender found. Run: sh tools/models/setup.sh" >&2
  exit 1
fi
bun tools/models/optimize.ts "$@"
