"""Human glass dome: geodesic steel frame, glass panels, foot ring, airlock, top hatch.

Size: radius 1, height 1 (the game scales it per building, see building-models.ts).
"""

import math

import bmesh
from mathutils import Matrix

from lib import bevel, chain, g, join, obj_from_bmesh, sphere, tube

R = 1.0


def half_geodesic():
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=3, radius=R)
    # Turn so that a ring of panels sits flat (looks less like a ball on its tip).
    bmesh.ops.rotate(bm, verts=bm.verts, matrix=Matrix.Rotation(math.radians(90), 3, 'X'))
    bmesh.ops.delete(bm, geom=[f for f in bm.faces if max(v.co.z for v in f.verts) < 0.02], context='FACES')
    for v in bm.verts:
        v.co.z = max(v.co.z, 0.0)
    return bm


def glass():
    return obj_from_bmesh('glass', half_geodesic(), 'domeGlass', smooth=False)


def frame():
    bm = half_geodesic()
    hubs = [v.co.copy() for v in bm.verts]
    ob = obj_from_bmesh('frame', bm, 'steel', smooth=False)
    wire = ob.modifiers.new('wire', 'WIREFRAME')
    wire.thickness = 0.022
    wire.use_even_offset = True
    wire.use_replace = True
    nodes = [sphere(f'hub{i}', 0.03, (c.x, c.z, -c.y), mat='steel', segs=5, rings=3) for i, c in enumerate(hubs)]
    return [ob, *nodes]


def foot_ring():
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=48, radius1=R + 0.07, radius2=R + 0.05, depth=0.1)
    inner = bmesh.new()
    bmesh.ops.translate(bm, verts=bm.verts, vec=(0, 0, 0.05))
    ring = obj_from_bmesh('foot', bm, 'white', smooth=False)
    inner.free()
    bevel(ring, 0.012)
    bolts = []
    for i in range(16):
        a = i / 16 * math.tau
        bolts.append(sphere(f'bolt{i}', 0.022, (math.cos(a) * (R + 0.07), 0.07, math.sin(a) * (R + 0.07)), mat='orange', segs=6, rings=4))
    lamps = [sphere(f'lamp{i}', 0.03, (math.cos(a) * (R + 0.075), 0.11, math.sin(a) * (R + 0.075)), mat='window', segs=8, rings=5)
             for i, a in enumerate([math.pi / 4 + k * math.pi / 2 for k in range(4)])]
    return [ring, *bolts, *lamps]


def airlock():
    """Airlock at the front (+z in the game)."""
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1)
    bmesh.ops.transform(bm, matrix=Matrix.Translation(g(0, 0.17, R + 0.05)) @ Matrix.Diagonal((0.3, 0.26, 0.32, 1)), verts=bm.verts)
    body = obj_from_bmesh('airlock', bm, 'white', smooth=False)
    bevel(body, 0.03, segments=3)
    door = bmesh.new()
    bmesh.ops.create_cube(door, size=1)
    bmesh.ops.transform(door, matrix=Matrix.Translation(g(0, 0.15, R + 0.21)) @ Matrix.Diagonal((0.2, 0.02, 0.24, 1)), verts=door.verts)
    door_ob = obj_from_bmesh('door', door, 'dark', smooth=False)
    stripe = bmesh.new()
    bmesh.ops.create_cube(stripe, size=1)
    bmesh.ops.transform(stripe, matrix=Matrix.Translation(g(0, 0.31, R + 0.15)) @ Matrix.Diagonal((0.32, 0.12, 0.04, 1)), verts=stripe.verts)
    stripe_ob = obj_from_bmesh('stripe', stripe, 'orange', smooth=False)
    light = sphere('doorLight', 0.025, (0, 0.34, R + 0.21), mat='window', segs=8, rings=5)
    return [body, door_ob, stripe_ob, light]


def top():
    hatch = tube('hatch', (0, R - 0.02, 0), (0, R + 0.05, 0), 0.12, 0.1, 'white', segs=16)
    ring = tube('hatchRing', (0, R + 0.05, 0), (0, R + 0.07, 0), 0.08, 0.08, 'orange', segs=16)
    mast = chain('antenna', [(0.04, R + 0.06, 0), (0.04, R + 0.3, 0)], [0.012, 0.006], 'steel', segs=6)
    tip = sphere('antennaTip', 0.02, (0.04, R + 0.31, 0), mat='window', segs=8, rings=5)
    return [hatch, ring, mast, tip]


def build():
    glass()
    solid = frame() + foot_ring() + airlock() + top()
    # One mesh per material keeps draw calls low (glTF splits by material anyway).
    join(solid, 'domeFrame')
