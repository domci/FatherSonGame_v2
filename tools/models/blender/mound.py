"""Alien living ground under every alien building: radius 1, low, with roots, a chitin rim and glow bumps.

The game scales it to the building (alien-helpers.ts, mound()). Slot 'glow' gets the building's glow color.
"""

import math

import bmesh

from lib import displace, g, join, obj_from_bmesh, sphere, sweep


def ground():
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=40, v_segments=12, radius=1)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < -0.05], context='VERTS')
    for v in bm.verts:
        v.co.z = max(0.0, v.co.z) * 0.14
    ob = obj_from_bmesh('ground', bm, 'fleshDark')
    displace(ob, 0.03, 0.12)
    return ob


def build():
    rim_pts = [(math.cos(a) * 0.93, 0.03 + 0.01 * math.sin(a * 5), math.sin(a) * 0.93) for a in [k / 32 * math.tau for k in range(33)]]
    rim = sweep('rim', rim_pts, [0.045] * 33, 'chitin', segs=6)
    roots = []
    for k in range(9):
        a = k / 9 * math.tau + 0.3
        pts = [(math.cos(a + d * 0.15) * r, 0.04 + 0.05 * math.sin(r * 6), math.sin(a + d * 0.15) * r)
               for d, r in enumerate([0.3, 0.5, 0.7, 0.9, 1.05])]
        roots.append(sweep(f'root{k}', pts, [0.04, 0.035, 0.03, 0.022, 0.0], 'chitinLight', segs=5))
    bumps = []
    for k in range(14):
        a = k / 14 * math.tau + 0.4
        d = 0.72 + ((k * 37) % 10) / 50
        bumps.append(sphere(f'bump{k}', 0.035 + (k % 3) * 0.012, (math.cos(a) * d, 0.08, math.sin(a) * d), (1, 0.8, 1), 'glow', segs=8, rings=5))
    join([ground()], 'ground')
    join([rim, *roots], 'roots')
    join(bumps, 'glow')
