"""Spider nest: a rocky mound with a dark burrow, sticky web strands and glowing eggs. About 1.8 wide."""

import math

import bmesh

from lib import displace, join, obj_from_bmesh, sphere, sweep


def mound():
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=40, v_segments=18, radius=1)
    for v in bm.verts:
        r = math.hypot(v.co.x, v.co.y)
        v.co.x *= 0.95
        v.co.y *= 0.95
        # A crater: low in the middle, a raised rim.
        v.co.z = max(0.0, v.co.z) * 0.55 - 0.6 * math.exp(-(r / 0.5) ** 2) * (v.co.z > 0)
    ob = obj_from_bmesh('mound', bm, 'rock')
    displace(ob, 0.09, 0.22, depth=3)
    return ob


def rocks():
    out = []
    for k in range(7):
        a = k / 7 * math.tau + 0.4
        d = 0.78 + (k % 3) * 0.08
        rock = sphere(f'rock{k}', 0.14 + (k % 3) * 0.05, (math.cos(a) * d, 0.12, math.sin(a) * d), (1.2, 1.1, 1), 'rock', segs=8, rings=6)
        displace(rock, 0.05, 0.08)
        out.append(rock)
    return out


def spires():
    """Bent rock claws around the crater."""
    out = []
    for k in range(5):
        a = k / 5 * math.tau + 0.2
        base = (math.cos(a) * 0.7, 0.1, math.sin(a) * 0.7)
        tip = (math.cos(a) * 0.45, 0.75 + (k % 2) * 0.15, math.sin(a) * 0.45)
        mid = (math.cos(a) * 0.72, 0.5, math.sin(a) * 0.72)
        spire = sweep(f'spire{k}', [base, mid, tip], [0.11, 0.07, 0.0], 'rock', segs=7)
        displace(spire, 0.03, 0.06)
        out.append(spire)
    return out


def webs():
    out = []
    for k in range(8):
        a = k / 8 * math.tau
        b = a + 0.9
        p0 = (math.cos(a) * 0.62, 0.22, math.sin(a) * 0.62)
        p2 = (math.cos(b) * 0.55, 0.24, math.sin(b) * 0.55)
        mid = (math.cos((a + b) / 2) * 0.35, 0.18, math.sin((a + b) / 2) * 0.35)
        out.append(sweep(f'web{k}', [p0, mid, p2], [0.007, 0.006, 0.007], 'bone', segs=4))
        out.append(sweep(f'webIn{k}', [p0, (0, 0.12, 0)], [0.006, 0.004], 'bone', segs=4))
    return out


def build():
    hole = sphere('burrow', 0.34, (0, -0.02, 0), (1, 0.2, 1), 'chitin', segs=20, rings=8)
    join([mound(), *rocks(), *spires()], 'ground')
    join([hole], 'burrow')
    join(webs(), 'webs')
    eggs = [sphere(f'egg{k}', 0.07 + (k % 2) * 0.02, (math.cos(a) * 0.48, 0.3, math.sin(a) * 0.48), (1, 1.3, 1), 'glowPink', segs=10, rings=8)
            for k, a in enumerate([0.3, 1.1, 2.6, 4.0, 5.2])]
    join(eggs, 'eggs')
