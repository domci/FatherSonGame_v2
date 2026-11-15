#!/bin/sh
# Installs Blender as a Python module (headless, no window) for the model scripts.
# Needs Python 3.13 (bpy 5.3 is built for it). About 430 MB download.
# Usage: sh tools/models/setup.sh   (then: bun run models)
set -e
VENV="${BLENDER_VENV:-.venv-blender}"
python3 -m venv "$VENV"
"$VENV/bin/pip" install --quiet "bpy==5.3.0"
"$VENV/bin/python" -c "import bpy; print('Blender', bpy.app.version_string, 'ready in $VENV')"
