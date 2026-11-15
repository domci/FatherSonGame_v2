"""Alien living vein piece, 1 tile long along z (the game repeats and stretches it).

A ribbed flesh tube with bulges, sinews that wind around it and glowing nodes.
Radius about 0.13, center at y = 0.11 (like the old code vein).
"""

import math

import bmesh

from lib import displace, g, join, obj_from_bmesh, sphere, sweep

Y = 0.11


def tube_body():
    bm = bmesh.new()
    rings = []
    n, segs = 13, 12
    for i in range(n):
        z = -0.5 + i / (n - 1)
        r = 0.12 + 0.02 * math.cos(z * math.tau * 2) + 0.012 * math.cos(z * math.tau * 6)
        rings.append([bm.verts.new(g(math.cos(t) * r, Y + math.sin(t) * r * 0.85, z)) for t in [k / segs * math.tau for k in range(segs)]])
    for r0, r1 in zip(rings, rings[1:]):
        for k in range(segs):
            bm.faces.new((r0[k], r0[(k + 1) % segs], r1[(k + 1) % segs], r1[k]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    ob = obj_from_bmesh('flesh', bm, 'fleshDark')
    displace(ob, 0.012, 0.05)
    return ob


def sinews():
    out = []
    for k in range(2):
        pts = []
        for i in range(13):
            z = -0.5 + i / 12
            a = k * math.pi + z * math.tau * 0.75
            r = 0.145
            pts.append((math.cos(a) * r, Y + math.sin(a) * r * 0.85, z))
        out.append(sweep(f'sinew{k}', pts, [0.014] * 13, 'chitinLight', segs=5))
    return out


def build():
    join([tube_body(), *sinews()], 'vein')
    nodes = [sphere(f'node{k}', 0.035, (0.09 * (k * 2 - 1), Y + 0.1, -0.25 + k * 0.5), (1, 0.7, 1.3), 'glowGreen', segs=8, rings=5) for k in range(2)]
    join(nodes, 'glow')
