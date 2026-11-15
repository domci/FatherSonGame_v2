"""Alien space fighter: an arrow-shaped living dart with blade wings, a glowing eye and tail spines. Faces +z."""

from lib import displace, join, loft, slab, sphere, sweep


def build():
    body = loft('body', [(-0.5, 0.02, 0.02, 0.3), (-0.3, 0.07, 0.06, 0.3), (0.0, 0.11, 0.08, 0.3),
                         (0.3, 0.07, 0.06, 0.3), (0.55, 0.0, 0.0, 0.29)], 'chitin', segs=14, power=2.2)
    displace(body, 0.01, 0.08)
    wings, ribs, glow = [], [], []
    for s in (-1, 1):
        wings.append(slab(f'wing{s}', [(s * 0.08, 0.15), (s * 0.55, -0.25), (s * 0.5, -0.32), (s * 0.08, -0.15)], 0.012, 0.3, 'membrane'))
        ribs.append(sweep(f'blade{s}', [(s * 0.08, 0.3, 0.16), (s * 0.35, 0.31, -0.05), (s * 0.58, 0.32, -0.3)], [0.025, 0.018, 0.0], 'chitinLight'))
        ribs.append(sweep(f'spine{s}', [(s * 0.03, 0.32, -0.4), (s * 0.12, 0.38, -0.6), (s * 0.1, 0.4, -0.7)], [0.018, 0.01, 0.0], 'bone'))
        glow.append(sphere(f'gland{s}', 0.03, (s * 0.1, 0.33, -0.1), (1, 0.6, 1.6), 'glowCyan', segs=8, rings=5))
    ribs.append(sweep('crest', [(0, 0.37, -0.35), (0, 0.4, 0.0), (0, 0.36, 0.3)], [0.0, 0.03, 0.0], 'chitinLight'))
    glow.append(sphere('eye', 0.045, (0, 0.33, 0.33), (1.3, 0.7, 1.0), 'glowGreen', segs=12, rings=6))
    glow.append(sphere('tail', 0.04, (0, 0.3, -0.48), (1, 1, 1.5), 'glowGreen', segs=10, rings=6))
    join([body, *ribs], 'body')
    join(wings, 'wings')
    join(glow, 'glow')
