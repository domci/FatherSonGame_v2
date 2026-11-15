"""Glowing alien mushroom: stem 1 high, cap radius 1 relative (game scales by [r, h, r]).

Gills under the cap, spots on top, a bulb at the foot.
"""

import math

import bmesh

from lib import g, join, obj_from_bmesh, sphere, sweep


def cap():
    bm = bmesh.new()
    rings, segs = [], 24
    profile = [(0.0, 1.32), (0.35, 1.3), (0.7, 1.22), (0.92, 1.1), (1.0, 0.98), (0.85, 0.94), (0.2, 0.97)]
    for r, y in profile:
        rings.append([bm.verts.new(g(math.cos(t) * r, y, math.sin(t) * r)) for t in [k / segs * math.tau for k in range(segs)]])
    for r0, r1 in zip(rings, rings[1:]):
        for k in range(segs):
            bm.faces.new((r0[k], r0[(k + 1) % segs], r1[(k + 1) % segs], r1[k]))
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-4)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return obj_from_bmesh('cap', bm, 'glowViolet')


def build():
    stem = sweep('stem', [(0, 0, 0), (0.04, 0.4, 0), (0, 0.8, 0.02), (0, 1.0, 0)], [0.24, 0.2, 0.17, 0.18], 'bone', segs=10)
    foot = sphere('foot', 0.3, (0, 0.06, 0), (1, 0.5, 1), 'bone', segs=12, rings=6)
    gills = [sweep(f'gill{k}', [(0, 0.97, 0), (math.cos(a) * 0.9, 0.95, math.sin(a) * 0.9)], [0.02, 0.01], 'chitinLight', segs=4)
             for k, a in enumerate([k / 16 * math.tau for k in range(16)])]
    spots = [sphere(f'spot{k}', 0.07, (math.cos(a) * d, 1.31 - d * 0.2, math.sin(a) * d), (1, 0.4, 1), 'glowPink', segs=8, rings=5)
             for k, (a, d) in enumerate([(0.3, 0.5), (2.0, 0.6), (3.6, 0.45), (5.0, 0.7), (1.2, 0.2)])]
    cap()
    join([stem, foot], 'stem')
    join(gills, 'gills')
    join(spots, 'spots')
