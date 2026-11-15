"""Human build drone: hovering white body, blue eye, four rotor pods, two tool arms. About 0.6 high. Faces +z.

Pivots: 'body', 'armL'/'armR'. Clips: Idle (hover), Run (lean forward), Attack (= building/repair, arms work).
"""

import math

from anim import add_clips
from lib import box, empty, join, loft, sphere, tube
from rig import bob, limb, merge, tilt


def build():
    body = empty('body', (0, 0.32, 0))
    shell = loft('shell', [(-0.16, 0.06, 0.06, 0.0), (-0.1, 0.15, 0.12, 0.0), (0.08, 0.15, 0.12, 0.0), (0.16, 0.08, 0.07, 0.0)],
                 'white', segs=16, power=2.4)
    ring = tube('ring', (0, -0.02, 0), (0, 0.02, 0), 0.17, 0.17, 'orange', segs=20)
    eye = sphere('eyeRim', 0.05, (0, 0.02, 0.15), (1, 1, 0.5), 'dark', segs=12, rings=8)
    lens = sphere('lens', 0.032, (0, 0.02, 0.17), mat='glowBlue', segs=10, rings=6)
    pods, glow = [], [lens]
    for k in range(4):
        a = k / 4 * math.tau + math.pi / 4
        x, z = math.cos(a) * 0.22, math.sin(a) * 0.22
        pods.append(tube(f'pod{k}', (x, -0.03, z), (x, 0.03, z), 0.06, 0.06, 'steel', segs=12))
        pods.append(box(f'strut{k}', (0.03, 0.02, 0.03), (x * 0.6, 0.0, z * 0.6), 'steel'))
        glow.append(sphere(f'jet{k}', 0.045, (x, -0.035, z), (1, 0.25, 1), 'glowBlue', segs=10, rings=4))
    antenna = tube('antenna', (0.05, 0.12, -0.05), (0.05, 0.22, -0.05), 0.008, 0.005, 'steel', segs=5)
    glow.append(sphere('tip', 0.012, (0.05, 0.225, -0.05), mat='window', segs=6, rings=4))
    join([shell], 'shellWhite', parent=body)
    join([ring], 'shellPaint', parent=body)
    join([eye, *pods, antenna], 'shellMetal', parent=body)
    join(glow, 'shellGlow', parent=body)
    for s, n in ((-1, 'armL'), (1, 'armR')):
        tool = [sphere(f'{n}Tool', 0.018, (0, -0.16, 0.1), mat='glowYellow' if s > 0 else 'glowBlue', segs=8, rings=5)]
        limb(n, (s * 0.1, -0.05, 0.08), [(0, 0, 0), (0, -0.08, 0.04), (0, -0.15, 0.09)], [0.02, 0.016, 0.012], 'steel',
             parent=body, extra=[tool], joint_mat='orange')
    add_clips([
        ('Idle', bob('body', 0.03, 1.6)),
        ('Run', merge(tilt('body', -0.25, 0.8), bob('body', 0.02, 0.8))),
        ('Attack', merge(bob('body', 0.015, 0.6),
                         {'armL': {'pitch': [(0, 0), (0.15, -0.6), (0.3, 0), (0.6, 0)]},
                          'armR': {'pitch': [(0, -0.6), (0.15, 0), (0.3, -0.6), (0.6, -0.6)]}})),
    ])
