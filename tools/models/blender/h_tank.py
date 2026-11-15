"""Human tank: armored hull on two tracks, turning turret with a laser cannon. Faces +z. About 1 long.

Pivots: 'turret' (turns), 'gun' (recoil), 'wheel*' (spin). Clips: Idle, Run, Shoot.
"""

import math

from anim import add_clips, loop
from lib import box, empty, join, loft, sphere, tube


def tracks():
    out, wheels = [], []
    for s in (-1, 1):
        out.append(loft(f'track{s}', [(-0.5, 0.09, 0.1, 0.12), (-0.42, 0.1, 0.12, 0.12), (0.42, 0.1, 0.12, 0.12), (0.52, 0.09, 0.09, 0.13)],
                        'dark', segs=12, power=5))
        out[-1].location.x = s * 0.34
        for k in range(11):
            out.append(box(f'tread{s}{k}', (0.205, 0.02, 0.03), (s * 0.34, 0.245, -0.4 + k * 0.08), 'steel'))
        for k in range(4):
            z = -0.33 + k * 0.22
            w = empty(f'wheel{s}{k}', (s * 0.45, 0.12, z))
            hub = tube(f'hub{s}{k}', (-0.01 * s, 0, 0), (0.02 * s, 0, 0), 0.08, 0.08, 'steel', segs=10)
            cap = box(f'spoke{s}{k}', (0.03, 0.12, 0.02), (0.025 * s, 0, 0), 'orange')
            join([hub, cap], f'wheelMesh{s}{k}', parent=w)
            wheels.append(w.name)
    return out, wheels


def hull():
    body = loft('hull', [(-0.48, 0.3, 0.07, 0.3), (-0.4, 0.34, 0.1, 0.31), (0.3, 0.34, 0.1, 0.31), (0.5, 0.28, 0.05, 0.28)],
                'white', segs=16, power=5)
    plates = [box(f'skirt{s}', (0.04, 0.12, 0.9), (s * 0.36, 0.3, 0), 'white', 0.01) for s in (-1, 1)]
    paint = [box(f'stripe{s}', (0.045, 0.03, 0.6), (s * 0.36, 0.33, 0.05), 'orange') for s in (-1, 1)]
    lights = [sphere(f'head{s}', 0.025, (s * 0.2, 0.33, 0.5), mat='window', segs=8, rings=5) for s in (-1, 1)]
    vents = [box(f'vent{k}', (0.3, 0.015, 0.025), (0, 0.42, -0.3 - k * 0.05), 'dark') for k in range(3)]
    return [body, *plates], paint, lights, vents


def turret():
    pivot = empty('turret', (0, 0.42, -0.02))
    shell = loft('turretShell', [(-0.22, 0.18, 0.08, 0.08), (-0.1, 0.22, 0.1, 0.09), (0.15, 0.18, 0.08, 0.08), (0.22, 0.1, 0.05, 0.07)],
                 'white', segs=16, power=3.5)
    hatch = tube('hatch', (0.07, 0.17, -0.05), (0.07, 0.2, -0.05), 0.05, 0.045, 'steel', segs=10)
    sensor = sphere('sensor', 0.03, (-0.1, 0.18, 0.08), mat='glowBlue', segs=8, rings=5)
    ring = box('turretStripe', (0.3, 0.02, 0.04), (0, 0.18, -0.12), 'orange')
    join([shell, hatch], 'turretBody', parent=pivot)
    join([ring], 'turretPaint', parent=pivot)
    join([sensor], 'turretGlow', parent=pivot)
    gun = empty('gun', (0, 0.09, 0.2), parent=pivot)
    barrel = tube('barrel', (0, 0, -0.05), (0, 0, 0.45), 0.035, 0.028, 'steel', segs=12)
    brake = tube('brake', (0, 0, 0.4), (0, 0, 0.48), 0.045, 0.045, 'dark', segs=12)
    muzzle = sphere('muzzle', 0.02, (0, 0, 0.49), mat='glowBlue', segs=8, rings=5)
    join([barrel, brake], 'gunMetal', parent=gun)
    join([muzzle], 'gunGlow', parent=gun)


def build():
    track_parts, wheels = tracks()
    body, paint, lights, vents = hull()
    join([*body], 'hullWhite')
    join([*track_parts, *vents], 'hullDark')
    join(paint, 'hullPaint')
    join(lights, 'hullGlow')
    turret()
    spin = {w: {'pitch': loop([0, math.pi * 2 / 3, math.pi * 4 / 3], 0.6)[:-1] + [(0.6, math.pi * 2)]} for w in wheels}
    add_clips([
        ('Idle', {'turret': {'turn': loop([0, 0.25, 0, -0.25], 4.0)}}),
        ('Run', {**spin, 'turret': {'turn': loop([0, 0.04, 0, -0.04], 0.6)}}),
        ('Shoot', {'gun': {'z': [(0, 0), (0.05, -0.1), (0.4, 0), (0.8, 0)]},
                   'turret': {'pitch': [(0, 0), (0.05, -0.04), (0.4, 0), (0.8, 0)]}}),
    ])
