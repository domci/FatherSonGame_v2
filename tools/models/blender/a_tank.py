"""Alien tank: a big armored crab with a spiked shell, six legs, two crushing claws and a glowing acid sac. Faces +z.

Pivots: 'body', 'leg0..5', 'clawL'/'clawR'. Clips: Idle, Walk, Attack (claws snap).
"""

import math

from anim import add_clips
from lib import displace, empty, join, loft, sphere, sweep
from rig import bob, legs_walk, limb, merge


def build():
    body = empty('body', (0, 0.28, 0))
    shell = loft('shell', [(-0.38, 0.1, 0.05, 0.02), (-0.25, 0.36, 0.13, 0.05), (0.1, 0.4, 0.15, 0.06), (0.32, 0.25, 0.1, 0.04), (0.4, 0.08, 0.04, 0.02)],
                 'chitin', segs=20, power=2.2)
    displace(shell, 0.02, 0.1)
    belly = loft('belly', [(-0.3, 0.25, 0.06, -0.04), (0.25, 0.28, 0.07, -0.03)], 'fleshDark', segs=14)
    spikes = [sweep(f'spike{k}', [(x, 0.17, z), (x * 1.3, 0.3, z - 0.04)], [0.035, 0.0], 'bone', segs=6)
              for k, (x, z) in enumerate([(0.18, 0.05), (-0.18, 0.05), (0.1, -0.15), (-0.1, -0.15), (0.0, 0.12)])]
    sac = sphere('sac', 0.12, (0, 0.17, -0.2), (1.3, 0.5, 1), 'glowGreen', segs=14, rings=8)
    eyes = [sweep(f'stalk{s}', [(s * 0.08, 0.1, 0.32), (s * 0.1, 0.22, 0.36)], [0.018, 0.012], 'chitinLight', segs=5) for s in (-1, 1)]
    eye_glow = [sphere(f'eye{s}', 0.03, (s * 0.1, 0.24, 0.36), mat='glowGreen', segs=8, rings=6) for s in (-1, 1)]
    join([shell], 'shellTop', parent=body)
    join([belly], 'shellBelly', parent=body)
    join([*spikes], 'shellBone', parent=body)
    join(eyes, 'shellStalks', parent=body)
    join([sac, *eye_glow], 'shellGlow', parent=body)
    legs = []
    for i in range(3):
        for s in (-1, 1):
            n = f'leg{i * 2 + (s > 0)}'
            z = 0.12 - i * 0.15
            limb(n, (s * 0.3, 0.0, z), [(0, 0, 0), (s * 0.2, 0.12, 0), (s * 0.34, -0.28, 0)], [0.04, 0.03, 0.0], 'chitinLight',
                 parent=body, joint_mat='chitin')
            legs.append(n)
    for s, n in ((-1, 'clawL'), (1, 'clawR')):
        pincer = [sphere(f'{n}Big', 0.08, (s * 0.06, 0.02, 0.24), (0.8, 0.7, 1.3), 'chitin', segs=12, rings=8),
                  sweep(f'{n}Upper', [(s * 0.06, 0.06, 0.3), (s * 0.04, 0.06, 0.4), (s * 0.0, 0.03, 0.46)], [0.035, 0.02, 0.0], 'bone', segs=6),
                  sweep(f'{n}Lower', [(s * 0.06, -0.02, 0.3), (s * 0.04, -0.03, 0.4), (s * 0.0, -0.01, 0.45)], [0.03, 0.018, 0.0], 'bone', segs=6)]
        limb(n, (s * 0.24, 0.0, 0.25), [(0, 0, 0), (s * 0.06, 0.02, 0.15)], [0.045, 0.04], 'chitinLight', parent=body, extra=[pincer])
    snap = {n: {'turn': [(0, 0), (0.12, s * 0.5), (0.25, 0), (0.6, 0)]} for s, n in ((1, 'clawL'), (-1, 'clawR'))}
    add_clips([
        ('Idle', merge(bob('body', 0.01, 2.0), {'clawL': {'turn': [(0, 0), (1, 0.12), (2, 0)]}})),
        ('Walk', merge(legs_walk(legs, 0.3, 0.5), bob('body', 0.015, 0.25))),
        ('Attack', merge(snap, {'body': {'z': [(0, 0), (0.12, 0.05), (0.3, 0), (0.6, 0)]}})),
    ])
