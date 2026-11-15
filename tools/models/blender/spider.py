"""Six-eyed spider creature (a bit creepy, no gore). About 1.2 tiles wide, faces +z in the game.

Legs hang under pivot nodes leg0..leg5 (hip joints); the game swings them
(src/render/models/spider-model.ts, animateSpider). Odd numbers = right side (+x).
"""

import math

from lib import displace, empty, join, sphere, sweep

EYES = [  # x, y, z, radius
    (0.05, 0.4, 0.4, 0.04),
    (-0.05, 0.4, 0.4, 0.04),
    (0.11, 0.39, 0.35, 0.026),
    (-0.11, 0.39, 0.35, 0.026),
    (0.035, 0.46, 0.35, 0.022),
    (-0.035, 0.46, 0.35, 0.022),
]


def abdomen():
    body = sphere('abdomen', 0.27, (0, 0.4, -0.32), (1, 0.82, 1.3), 'chitin', segs=28, rings=18)
    displace(body, 0.025, 0.08)
    plates = [sphere(f'plate{i}', 0.2 - i * 0.03, (0, 0.6 - i * 0.025, -0.2 - i * 0.13), (1.15, 0.35, 0.9), 'chitinLight', segs=16, rings=8)
              for i in range(3)]
    spin = sphere('spinner', 0.05, (0, 0.33, -0.66), (1, 0.8, 1.3), 'chitinLight', segs=10, rings=6)
    spikes = []
    for i in range(5):
        z = -0.12 - i * 0.11
        for side in (-1, 1):
            x = side * (0.1 + 0.02 * math.sin(i))
            y = 0.58 - (i - 2) ** 2 * 0.018
            spikes.append(sweep(f'spike{i}{side}', [(x, y, z), (x * 1.5, y + 0.1, z - 0.04)], [0.018, 0.0], 'bone', segs=5))
    return [body, *plates, spin, *spikes]


def front():
    thorax = sphere('thorax', 0.18, (0, 0.38, 0.06), (1, 0.7, 1.1), 'chitin', segs=24, rings=14)
    displace(thorax, 0.015, 0.06)
    head = sphere('head', 0.13, (0, 0.38, 0.28), (1, 0.85, 0.95), 'chitin', segs=20, rings=12)
    crest = sweep('crest', [(0, 0.5, -0.06), (0, 0.52, 0.1), (0, 0.48, 0.28)], [0.02, 0.025, 0.0], 'chitinLight', segs=6)
    sockets = [sphere(f'socket{i}', r * 1.35, (x, y, z - 0.01), mat='chitinLight', segs=10, rings=6) for i, (x, y, z, r) in enumerate(EYES)]
    jaws = []
    for side in (-1, 1):
        jaws.append(sphere(f'jaw{side}', 0.045, (side * 0.045, 0.3, 0.38), (1, 1.3, 1), 'chitin', segs=10, rings=8))
        jaws.append(sweep(f'fang{side}', [(side * 0.05, 0.26, 0.4), (side * 0.04, 0.17, 0.43), (side * 0.015, 0.13, 0.4)], [0.022, 0.014, 0.0], 'bone', segs=6))
        jaws.append(sweep(f'palp{side}', [(side * 0.08, 0.33, 0.36), (side * 0.14, 0.36, 0.46), (side * 0.12, 0.22, 0.52)], [0.018, 0.014, 0.006], 'chitinLight', segs=6))
    return [thorax, head, crest, *sockets, *jaws]


def glow():
    eyes = [sphere(f'eye{i}', r, (x, y, z), mat='glowPink', segs=12, rings=8) for i, (x, y, z, r) in enumerate(EYES)]
    spots = [sphere(f'spot{i}', 0.03 - i * 0.004, (s * 0.07, 0.6 - i * 0.03, -0.24 - i * 0.12), (1, 0.5, 1.4), 'glowPink', segs=8, rings=5)
             for i in range(3) for s in (-1, 1)]
    return eyes + spots


def leg(i, side):
    """One leg in the pivot's own space; the leg points along +x * side."""
    z = (0.16, 0.06, -0.05)[i]
    pivot = empty(f'leg{i * 2 + (1 if side > 0 else 0)}', (side * 0.11, 0.36, z), -side * (0.55 - i * 0.45))
    reach = 1 - abs(i - 1) * 0.06
    pts = [(0, 0, 0), (side * 0.3 * reach, 0.2, 0), (side * 0.5 * reach, 0.08, 0), (side * 0.62 * reach, -0.36, 0)]
    limb = sweep(f'limb{i}{side}', pts, [0.036, 0.03, 0.02, 0.0], 'chitinLight', segs=7)
    knees = [sphere(f'knee{i}{side}{k}', r, p, mat='chitin', segs=8, rings=6) for k, (p, r) in enumerate([(pts[1], 0.038), (pts[2], 0.026)])]
    hairs = [sweep(f'hair{i}{side}{k}', [p, (p[0] + side * 0.03, p[1] + 0.06, 0.01)], [0.006, 0.0], 'chitin', segs=4)
             for k, p in enumerate([(side * 0.15 * reach, 0.13, 0), (side * 0.38 * reach, 0.17, 0), (side * 0.55 * reach, -0.05, 0)])]
    join([limb, *knees, *hairs], f'legMesh{i}{side}', parent=pivot)


def build():
    join(abdomen() + front(), 'body')
    join(glow(), 'eyes')
    for i in range(3):
        for side in (-1, 1):
            leg(i, side)
