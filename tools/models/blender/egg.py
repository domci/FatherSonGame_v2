"""Spider eggs: a small clutch of glowing, veined eggs in a sticky base. About 0.5 wide."""

import math

from lib import displace, join, sphere, sweep

EGGS = [(0.0, 0.0, 0.17, 1.0), (0.17, 0.08, 0.11, 0.9), (-0.12, 0.12, 0.1, 1.1)]


def veins(i, x, z, r):
    out = []
    for k in range(4):
        phi = k / 4 * math.tau + i
        pts = []
        for s in range(5):
            t = 0.15 + s * 0.17
            a = phi + math.sin(s * 1.7 + k) * 0.3
            rr = r * math.sin(math.pi * t) * 1.03
            pts.append((x + math.cos(a) * rr, r * 1.3 * t * 2, z + math.sin(a) * rr))
        out.append(sweep(f'vein{i}{k}', pts, [0.008, 0.009, 0.008, 0.006, 0.0], 'fleshDark', segs=4))
    return out


def build():
    eggs, skins, lines = [], [], []
    for i, (x, z, r, tall) in enumerate(EGGS):
        eggs.append(sphere(f'core{i}', r * 0.8, (x, r * 1.3 * tall, z), (1, 1.3 * tall, 1), 'glowPink', segs=14, rings=10))
        skins.append(sphere(f'skin{i}', r, (x, r * 1.3 * tall, z), (1, 1.3 * tall, 1), 'membrane', segs=18, rings=12))
        lines += veins(i, x, z, r)
    goo = sphere('goo', 0.26, (0.02, 0.0, 0.06), (1, 0.18, 1), 'fleshDark', segs=18, rings=8)
    displace(goo, 0.03, 0.05)
    join(eggs, 'cores')
    join(skins, 'skins')
    join([goo, *lines], 'base')
