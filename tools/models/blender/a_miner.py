"""Alien mining creature-ship: a beetle-like shell with grabbing mandibles and a glowing crop sac. Faces +z."""

import math

from lib import displace, join, loft, sphere, sweep


def build():
    shell = loft('shell', [(-0.45, 0.05, 0.04, 0.25), (-0.3, 0.22, 0.14, 0.28), (0.05, 0.26, 0.17, 0.3),
                           (0.3, 0.2, 0.13, 0.28), (0.42, 0.08, 0.06, 0.26)], 'chitin', segs=20, power=2.2)
    displace(shell, 0.015, 0.1)
    seam = sweep('seam', [(0, 0.47, -0.4), (0, 0.48, 0.0), (0, 0.42, 0.35)], [0.0, 0.025, 0.0], 'chitinLight')
    head = sphere('head', 0.1, (0, 0.27, 0.45), (1.2, 0.8, 0.9), 'chitinLight', segs=14, rings=8)
    sac = sphere('sac', 0.15, (0, 0.18, -0.08), (1.1, 0.6, 1.5), 'glowViolet', segs=16, rings=8)
    jaws, legs, glow = [], [], [sac]
    for s in (-1, 1):
        jaws.append(sweep(f'jaw{s}', [(s * 0.06, 0.25, 0.5), (s * 0.16, 0.22, 0.62), (s * 0.06, 0.18, 0.74)], [0.03, 0.022, 0.0], 'bone'))
        glow.append(sphere(f'eye{s}', 0.025, (s * 0.06, 0.32, 0.52), mat='glowGreen', segs=8, rings=5))
        for k in range(3):
            z = 0.2 - k * 0.2
            a = math.radians(20 - k * 20)
            legs.append(sweep(f'leg{s}{k}', [(s * 0.2, 0.22, z), (s * 0.36, 0.3, z + math.sin(a) * 0.1), (s * 0.42, 0.08, z + math.sin(a) * 0.15)],
                              [0.025, 0.02, 0.0], 'chitinLight'))
    spots = [sphere(f'spot{k}', 0.025, (0.1 * (k % 2 * 2 - 1), 0.45, 0.2 - k * 0.12), mat='glowGreen', segs=6, rings=4) for k in range(4)]
    join([shell, head], 'shell')
    join([seam, *jaws, *legs], 'limbs')
    join([*glow, *spots], 'glow')
