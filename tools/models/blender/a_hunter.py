"""Alien hunter: an armored flying beetle-bee with four buzzing wings, a stinger and green eyes. Faces +z.

Pivots: 'body', 'wingL0/1', 'wingR0/1', 'sting'. Clips: Idle, Run (fly fast), Attack (sting).
"""

import math

from anim import add_clips
from lib import displace, empty, join, loft, slab, sphere, sweep
from rig import bob, flap, merge, tilt


def build():
    body = empty('body', (0, 0.42, 0))
    thorax = loft('thorax', [(-0.08, 0.06, 0.06, 0), (0.0, 0.1, 0.09, 0.0), (0.1, 0.08, 0.08, 0.0), (0.14, 0.03, 0.03, 0.0)], 'chitin', segs=14, power=2.2)
    head = sphere('head', 0.07, (0, 0.02, 0.17), (1.1, 0.9, 1), 'chitin', segs=14, rings=10)
    abdomen = loft('abdomen', [(-0.08, 0.06, 0.06, -0.01), (-0.18, 0.1, 0.09, -0.04), (-0.3, 0.07, 0.07, -0.07), (-0.38, 0.0, 0.0, -0.1)],
                   'chitinLight', segs=14, power=2.2)
    displace(abdomen, 0.006, 0.04)
    bands = [sweep(f'band{k}', [(0.1 * math.cos(a) * (1 - k * 0.2), -0.03 - k * 0.02 + 0.09 * math.sin(a) * (1 - k * 0.2), -0.16 - k * 0.07)
                                for a in [i / 12 * math.tau for i in range(13)]], [0.01] * 13, 'chitin', segs=4) for k in range(3)]
    eyes = [sphere(f'eye{s}', 0.03, (s * 0.045, 0.04, 0.22), mat='glowGreen', segs=8, rings=6) for s in (-1, 1)]
    feelers = [sweep(f'feeler{s}', [(s * 0.03, 0.08, 0.2), (s * 0.06, 0.16, 0.26), (s * 0.1, 0.18, 0.3)], [0.008, 0.006, 0.0], 'bone', segs=4) for s in (-1, 1)]
    legs = [sweep(f'leg{s}{k}', [(s * 0.05, -0.05, 0.08 - k * 0.07), (s * 0.12, -0.1, 0.1 - k * 0.07), (s * 0.13, -0.2, 0.07 - k * 0.07)],
                  [0.012, 0.009, 0.0], 'chitin', segs=4) for s in (-1, 1) for k in range(3)]
    join([thorax, head, *bands, *legs], 'bodyShell', parent=body)
    join([abdomen], 'bodyBack', parent=body)
    join([*feelers], 'bodyBone', parent=body)
    join(eyes, 'bodyGlow', parent=body)
    sting = empty('sting', (0, -0.1, -0.38), parent=body)
    join([sweep('stinger', [(0, 0, 0), (0, -0.02, -0.08), (0, -0.05, -0.12)], [0.02, 0.01, 0.0], 'bone', segs=6),
          sphere('venom', 0.012, (0, -0.05, -0.12), mat='glowGreen', segs=6, rings=4)], 'stingMesh', parent=sting)
    wings = {}
    for s, side in ((-1, 'L'), (1, 'R')):
        for k in (0, 1):
            n = f'wing{side}{k}'
            w = empty(n, (s * 0.06, 0.09, 0.04 - k * 0.08), parent=body)
            pts = [(0, 0.03), (s * 0.3, 0.0 - k * 0.04), (s * 0.34, -0.06 - k * 0.04), (0, -0.04)]
            join([slab(f'{n}M', pts, 0.006, 0, 'membrane')], f'{n}Mesh', parent=w)
            join([sweep(f'{n}V', [(0, 0, 0.0), (s * 0.32, 0, -0.03 - k * 0.04)], [0.006, 0.0], 'chitinLight', segs=4)], f'{n}Vein', parent=w)
            wings.setdefault(side, []).append(n)
    buzz = merge(flap(wings['L'][0], wings['R'][0], 0.6, 0.12), flap(wings['L'][1], wings['R'][1], 0.5, 0.12))
    add_clips([
        ('Idle', merge(bob('body', 0.03, 1.2), buzz)),
        ('Run', merge(tilt('body', -0.3, 0.6), buzz)),
        ('Attack', merge(buzz, {'sting': {'pitch': [(0, 0), (0.1, -0.8), (0.3, 0), (0.5, 0)]},
                                'body': {'z': [(0, 0), (0.1, 0.06), (0.3, 0), (0.5, 0)]}})),
    ])
