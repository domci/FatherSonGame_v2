"""Human space fighter: forward cockpit pod, four angled wings with lasers, big rear engine. Faces +z."""

import math

from mathutils import Matrix

from lib import engine, g, join, loft, slab, sphere, tube

TILT = math.radians(24)
SPAN = 0.5


def wing(k, sx, sy):
    pts = [(sx * 0.05, -0.3), (sx * 0.05, 0.05), (sx * SPAN, -0.2), (sx * SPAN, -0.32)]
    w = slab(f'wing{k}', pts, 0.02, 0.0, 'white' if sy > 0 else 'orange')
    # Turn around the length axis (game z = Blender -y) so the wing points up or down, then lift.
    w.data.transform(Matrix.Rotation(-sx * sy * TILT, 4, 'Y'))
    w.data.transform(Matrix.Translation(g(0, 0.3, 0)))
    w.data.update()
    return w


def build():
    body = loft('body', [(-0.4, 0.09, 0.09, 0.3), (-0.2, 0.11, 0.1, 0.3), (0.15, 0.09, 0.09, 0.3),
                         (0.38, 0.05, 0.06, 0.3), (0.5, 0.01, 0.02, 0.3)], 'white', segs=16, power=3)
    upper, lower, guns, glow = [], [], [], []
    for k, (sx, sy) in enumerate([(1, 1), (-1, 1), (1, -1), (-1, -1)]):
        (upper if sy > 0 else lower).append(wing(k, sx, sy))
        x, y = sx * SPAN * math.cos(TILT), 0.3 + sy * SPAN * math.sin(TILT)
        guns.append(tube(f'gun{k}', (x, y, -0.3), (x, y, 0.15), 0.014, 0.01, 'steel', segs=8))
        glow.append(sphere(f'muzzle{k}', 0.012, (x, y, 0.16), mat='glowBlue', segs=6, rings=4))
    canopy = sphere('canopy', 0.08, (0, 0.37, 0.18), (0.9, 0.7, 1.6), 'glass', segs=16, rings=10)
    shells, core = engine('main', (0, 0.3, -0.38), 0.085, 0.14)
    glow.append(core)
    for s in (-1, 1):
        sh, c = engine(f'side{s}', (s * 0.11, 0.3, -0.34), 0.035, 0.1)
        shells += sh
        glow.append(c)
    join([body, *upper], 'hull')
    join([*lower, *shells[1::2]], 'paint')
    join([*guns, *shells[0::2]], 'metal')
    join([canopy], 'canopy')
    join(glow, 'glow')
