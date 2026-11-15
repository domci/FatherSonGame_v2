"""Human mining ship: ore hopper, two drill arms in front, cockpit on top. Faces +z."""

import math

from lib import box, engine, join, loft, sphere, sweep, tube


def drill(name, x):
    parts = [tube(f'{name}Cone', (x, 0.2, 0.38), (x, 0.2, 0.6), 0.06, 0.0, 'steel', segs=12)]
    for k in range(3):
        a = k / 3 * math.tau
        pts = [(x + math.cos(a + t * 2) * 0.055 * (1 - t), 0.2 + math.sin(a + t * 2) * 0.055 * (1 - t), 0.38 + t * 0.2) for t in (0, 0.33, 0.66, 0.95)]
        parts.append(sweep(f'{name}Thread{k}', pts, [0.012, 0.01, 0.007, 0.0], 'orange', segs=4))
    return parts


def build():
    hull = loft('hull', [(-0.42, 0.18, 0.12, 0.25), (-0.2, 0.24, 0.16, 0.27), (0.2, 0.22, 0.15, 0.27),
                         (0.36, 0.15, 0.1, 0.24)], 'white', segs=18, power=4)
    hopper = box('hopper', (0.32, 0.12, 0.34), (0, 0.45, -0.12), 'dark', 0.02)
    ore = sphere('ore', 0.14, (0, 0.5, -0.12), (1.0, 0.35, 1.0), 'glowYellow', segs=12, rings=6)
    cockpit = sphere('cockpit', 0.09, (0, 0.42, 0.22), (1.0, 0.6, 1.1), 'glass', segs=14, rings=8)
    metal, paint, glow = [hopper], [], [ore]
    for s in (-1, 1):
        metal.append(sweep(f'arm{s}', [(s * 0.15, 0.25, 0.2), (s * 0.2, 0.22, 0.32), (s * 0.18, 0.2, 0.4)], [0.035, 0.03, 0.03], 'steel'))
        paint += drill(f'drill{s}', s * 0.18)
        glow.append(sphere(f'lamp{s}', 0.025, (s * 0.12, 0.33, 0.36), mat='window', segs=8, rings=5))
        paint.append(box(f'side{s}', (0.02, 0.06, 0.4), (s * 0.235, 0.27, 0.0), 'orange'))
    sh, core = engine('eng', (0, 0.26, -0.4), 0.08, 0.12)
    metal.append(sh[0])
    paint.append(sh[1])
    glow.append(core)
    join([hull], 'hull')
    join(paint, 'paint')
    join(metal, 'metal')
    join([cockpit], 'canopy')
    join(glow, 'glow')
