"""Alien build drone: a floating jelly bell with a glowing core and tentacles that work. About 0.6 high.

Pivots: 'body', 'tent0..5'. Clips: Idle (float), Run (lean, tentacles trail), Attack (= building, tentacles reach).
"""

import math

import bmesh

from anim import add_clips, loop
from lib import displace, empty, g, join, obj_from_bmesh, sphere
from rig import bob, limb, merge, tilt


def bell():
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=24, v_segments=12, radius=1)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < -0.3], context='VERTS')
    for v in bm.verts:
        phi = math.atan2(v.co.y, v.co.x)
        k = 0.17 * (1 + 0.08 * math.cos(8 * phi) * (1 - v.co.z))
        v.co = g(v.co.x * k, v.co.z * 0.14, -v.co.y * k)
    ob = obj_from_bmesh('bell', bm, 'chitin')
    displace(ob, 0.008, 0.05)
    return ob


def build():
    body = empty('body', (0, 0.4, 0))
    inner = sphere('core', 0.08, (0, 0.03, 0), (1, 0.8, 1), 'glowCyan', segs=12, rings=8)
    skin = sphere('skin', 0.15, (0, 0.0, 0), (1, 0.75, 1), 'membrane', segs=16, rings=8)
    spots = [sphere(f'spot{k}', 0.015, (math.cos(a) * 0.15, 0.06, math.sin(a) * 0.15), mat='glowGreen', segs=6, rings=4)
             for k, a in enumerate([k / 8 * math.tau for k in range(8)])]
    join([bell()], 'bellShell', parent=body)
    join([skin], 'bellSkin', parent=body)
    join([inner, *spots], 'bellGlow', parent=body)
    tents = []
    for k in range(6):
        a = k / 6 * math.tau
        x, z = math.cos(a) * 0.1, math.sin(a) * 0.1
        n = f'tent{k}'
        limb(n, (x, -0.04, z), [(0, 0, 0), (x * 0.3, -0.1, z * 0.3), (x * 0.1, -0.22, z * 0.1), (x * 0.4, -0.3, z * 0.4)],
             [0.018, 0.014, 0.01, 0.0], 'fleshDark', parent=body)
        tents.append(n)
    wave = {n: {'pitch': loop([0.2, -0.2] if i % 2 else [-0.2, 0.2], 1.2)} for i, n in enumerate(tents)}
    reach = {n: {'pitch': [(0, 0), (0.2, -0.7), (0.4, 0), (0.6, 0)]} for n in tents[:2]}
    add_clips([
        ('Idle', merge(bob('body', 0.03, 2.0), wave)),
        ('Run', merge(tilt('body', -0.2, 0.8), bob('body', 0.015, 0.8), wave)),
        ('Attack', merge(bob('body', 0.01, 0.6), reach)),
    ])
