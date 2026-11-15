"""Human glass tunnel piece, 1 tile long along z (the game repeats and stretches it).

Glass tube with a steel ring frame in the middle, struts along the top, a floor grating,
small lamps and two feet. Tube radius 0.2, center at y = 0.2 (like the old code tunnel).
"""

import math

import bmesh
from mathutils import Matrix

from lib import box, g, join, obj_from_bmesh, sphere, sweep, tube

R = 0.2
Y = 0.2


def glass():
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=False, segments=20, radius1=R, radius2=R, depth=1.0)
    bmesh.ops.transform(bm, matrix=Matrix.Translation(g(0, Y, 0)) @ Matrix.Rotation(math.pi / 2, 4, 'X'), verts=bm.verts)
    return obj_from_bmesh('glass', bm, 'domeGlass')


def ring(z, r=R + 0.02, thick=0.03):
    pts = [(math.cos(a) * r, Y + math.sin(a) * r, z) for a in [k / 16 * math.tau for k in range(17)]]
    return sweep(f'ring{z}', pts, [thick] * len(pts), 'steel', segs=6)


def build():
    glass()
    metal = [ring(0.0), ring(-0.5, thick=0.018), ring(0.5, thick=0.018)]
    for a in (math.pi / 2, math.pi / 4, 3 * math.pi / 4):
        x, y = math.cos(a) * (R + 0.012), Y + math.sin(a) * (R + 0.012)
        metal.append(tube(f'strut{a:.2f}', (x, y, -0.5), (x, y, 0.5), 0.008, 0.008, 'steel', segs=5))
    floor = box('floor', (0.3, 0.03, 1.0), (0, 0.045, 0), 'dark')
    bars = [box(f'bar{i}', (0.3, 0.012, 0.02), (0, 0.065, -0.45 + i * 0.1), 'steel') for i in range(10)]
    feet = [box(f'foot{s}', (0.05, 0.06, 0.08), (s * 0.17, 0.03, 0), 'white', 0.008) for s in (-1, 1)]
    lamps = [sphere(f'lamp{s}', 0.016, (s * 0.12, 0.33, 0.0), mat='window', segs=8, rings=5) for s in (-1, 1)]
    stripes = [box(f'stripe{s}', (0.02, 0.02, 0.1), (s * 0.15, 0.07, 0.0), 'orange') for s in (-1, 1)]
    join([*metal, *bars], 'frame')
    join([floor], 'floor')
    join([*feet, *stripes], 'feet')
    join(lamps, 'lamps')
