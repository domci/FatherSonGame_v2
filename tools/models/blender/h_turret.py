"""Human laser turret (the turning head of defense buildings): about 0.6 wide, 0.9 high, guns to +z."""

import math

from lib import box, join, loft, sphere, tube


def build():
    base = tube('base', (0, 0, 0), (0, 0.18, 0), 0.3, 0.26, 'steel', segs=20)
    ring = tube('ring', (0, 0.18, 0), (0, 0.22, 0), 0.27, 0.27, 'orange', segs=20)
    neck = tube('neck', (0, 0.22, 0), (0, 0.42, 0), 0.12, 0.1, 'dark', segs=12)
    head = loft('head', [(-0.22, 0.12, 0.12, 0.55), (-0.05, 0.2, 0.15, 0.56), (0.15, 0.17, 0.12, 0.56), (0.25, 0.1, 0.07, 0.55)], 'white', segs=16, power=3.5)
    armor = [box(f'armor{s}', (0.04, 0.2, 0.3), (s * 0.2, 0.56, -0.02), 'white', 0.01) for s in (-1, 1)]
    metal, glow = [neck], []
    for s in (-1, 1):
        metal.append(tube(f'barrel{s}', (s * 0.08, 0.55, 0.15), (s * 0.08, 0.55, 0.62), 0.03, 0.022, 'steel', segs=10))
        metal.append(tube(f'shroud{s}', (s * 0.08, 0.55, 0.2), (s * 0.08, 0.55, 0.36), 0.045, 0.045, 'dark', segs=10))
        glow.append(sphere(f'muzzle{s}', 0.02, (s * 0.08, 0.55, 0.63), mat='glowBlue', segs=8, rings=5))
    sensor = sphere('sensor', 0.05, (0, 0.7, 0.08), (1, 0.7, 1), 'glowBlue', segs=10, rings=6)
    stripe = box('stripe', (0.3, 0.02, 0.06), (0, 0.71, -0.12), 'orange')
    vents = [box(f'vent{k}', (0.24, 0.015, 0.02), (0, 0.6 - k * 0.04, -0.22), 'dark') for k in range(3)]
    join([head, *armor], 'shell')
    join([base, *metal, *vents], 'metal')
    join([ring, stripe], 'paint')
    join([sensor, *glow], 'glow')
