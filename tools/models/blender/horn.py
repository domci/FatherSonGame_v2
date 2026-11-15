"""Alien bone horn: 1 high, bends outward to +x, ridged, with a glowing tip. Base radius 0.06."""

import math

from lib import join, sphere, sweep


def build():
    n = 9
    pts, radii = [], []
    for i in range(n):
        v = i / (n - 1)
        pts.append((0.35 * (v * v * 0.6 + v * 0.4), v, 0))
        radii.append(0.06 * (1 - v * 0.9) * (1 + 0.12 * (i % 2)))
    radii[-1] = 0.0
    horn = sweep('horn', pts, radii, 'bone', segs=8)
    rings = [sweep(f'ring{i}', [(pts[i][0] + math.cos(a) * radii[i] * 1.1, pts[i][1], math.sin(a) * radii[i] * 1.1) for a in [k / 8 * math.tau for k in range(9)]],
                   [0.008] * 9, 'chitinLight', segs=4) for i in (1, 3, 5)]
    tip = sphere('tip', 0.018, pts[-2], mat='glowGreen', segs=6, rings=4)
    join([horn, *rings], 'horn')
    join([tip], 'tip')
