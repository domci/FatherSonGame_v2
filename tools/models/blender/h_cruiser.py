"""Human space cruiser: long hull with a bridge tower, gun turrets, hangar and big engine block. Faces +z."""

from lib import box, engine, fin, join, loft, sphere, tube


def turret(name, x, y, z):
    base = tube(f'{name}Base', (x, y, z), (x, y + 0.04, z), 0.06, 0.05, 'steel', segs=12)
    head = box(f'{name}Head', (0.08, 0.04, 0.08), (x, y + 0.06, z), 'white', 0.008)
    guns = [tube(f'{name}Gun{s}', (x + s * 0.02, y + 0.06, z), (x + s * 0.02, y + 0.06, z + 0.14), 0.008, 0.007, 'dark', segs=6) for s in (-1, 1)]
    return [base, head, *guns]


def build():
    hull = loft('hull', [(-0.6, 0.16, 0.1, 0.3), (-0.4, 0.2, 0.12, 0.3), (0.1, 0.18, 0.11, 0.3),
                         (0.45, 0.1, 0.07, 0.3), (0.65, 0.03, 0.03, 0.3)], 'white', segs=16, power=3.5)
    keel = loft('keel', [(-0.5, 0.08, 0.05, 0.19), (0.3, 0.06, 0.04, 0.2), (0.5, 0.02, 0.02, 0.22)], 'steel', segs=10)
    tower = box('tower', (0.1, 0.12, 0.16), (0, 0.46, -0.28), 'white', 0.015)
    bridge = box('bridge', (0.14, 0.04, 0.06), (0, 0.53, -0.22), 'white', 0.01)
    windows = box('windows', (0.145, 0.015, 0.02), (0, 0.53, -0.19), 'window')
    tail = fin('tail', [(-0.55, 0.4), (-0.35, 0.4), (-0.48, 0.58), (-0.58, 0.58)], 0.02, 0, 'orange')
    stripes = [box(f'stripe{s}', (0.01, 0.03, 0.7), (s * 0.19, 0.3, -0.1), 'orange') for s in (-1, 1)]
    hangar = box('hangar', (0.12, 0.05, 0.02), (0, 0.24, 0.4), 'dark')
    metal, glow = [hangar], [windows]
    for z in (0.05, 0.25):
        metal += turret(f't{z}', 0, 0.4, z)
    for s in (-1, 1):
        metal += turret(f'side{s}', s * 0.14, 0.38, -0.05)
    shells = []
    for x, y, r in [(0, 0.3, 0.09), (-0.12, 0.27, 0.06), (0.12, 0.27, 0.06), (0, 0.18, 0.05)]:
        sh, core = engine(f'eng{x}{y}', (x, y, -0.6), r, 0.12)
        shells += sh
        glow.append(core)
    lights = [sphere(f'nav{i}', 0.012, (x, 0.32, z), mat='glowBlue', segs=6, rings=4) for i, (x, z) in enumerate([(-0.18, -0.3), (0.18, -0.3), (-0.12, 0.2), (0.12, 0.2)])]
    join([hull, tower, bridge], 'hull')
    join([tail, *stripes, *shells[1::2]], 'paint')
    join([keel, *metal, *shells[0::2]], 'metal')
    join([*glow, *lights], 'glow')
