"""Alien flak walker: a bulb on four insect legs with three spore cannons that point to the sky. Faces +z.

Pivots: 'body', 'leg0..3', 'guns'. Clips: Idle, Walk, Shoot.
"""

import math

from anim import add_clips
from lib import displace, empty, join, sphere, sweep
from rig import bob, legs_walk, limb, merge, recoil


def build():
    body = empty('body', (0, 0.5, 0))
    bulb = sphere('bulb', 0.24, (0, 0.05, 0), (1, 0.75, 1.15), 'chitin', segs=20, rings=12)
    displace(bulb, 0.02, 0.08)
    ribs = [sweep(f'rib{k}', [(math.cos(a) * 0.25, 0.05 + math.sin(t) * 0.17, math.sin(a) * 0.28 * math.cos(t)) for t in [-0.9, -0.3, 0.3, 0.9]],
                  [0.02, 0.025, 0.025, 0.02], 'chitinLight', segs=5) for k, a in enumerate([0.4, 2.7])]
    under = sphere('under', 0.14, (0, -0.1, 0), (1, 0.5, 1), 'glowViolet', segs=12, rings=6)
    eyes = [sphere(f'eye{s}', 0.025, (s * 0.07, 0.08, 0.27), mat='glowGreen', segs=8, rings=5) for s in (-1, 1)]
    join([bulb], 'bulbShell', parent=body)
    join(ribs, 'bulbRibs', parent=body)
    join([under, *eyes], 'bulbGlow', parent=body)
    guns = empty('guns', (0, 0.2, -0.03), parent=body)
    tubes, tips = [], []
    for k, (x, z) in enumerate([(0, 0.06), (-0.08, -0.04), (0.08, -0.04)]):
        tubes.append(sweep(f'gun{k}', [(x, 0, z), (x * 1.2, 0.12, z + 0.06), (x * 1.3, 0.22, z + 0.12)], [0.04, 0.035, 0.03], 'bone', segs=8))
        tips.append(sphere(f'spore{k}', 0.028, (x * 1.3, 0.23, z + 0.125), mat='glowGreen', segs=8, rings=5))
    join(tubes, 'gunBone', parent=guns)
    join(tips, 'gunGlow', parent=guns)
    legs = []
    for k, a in enumerate([0.6, 2.5, 3.8, 5.7]):
        n = f'leg{k}'
        x, z = math.cos(a), math.sin(a)
        limb(n, (x * 0.18, -0.02, z * 0.18), [(0, 0, 0), (x * 0.18, 0.15, z * 0.18), (x * 0.32, -0.48, z * 0.32)], [0.04, 0.03, 0.0],
             'chitinLight', parent=body, joint_mat='chitin')
        legs.append(n)
    add_clips([
        ('Idle', merge(bob('body', 0.015, 2.0), {'guns': {'turn': [(0, 0), (1.5, 0.4), (3, 0)]}})),
        ('Walk', merge(legs_walk(legs, 0.3, 0.7), bob('body', 0.02, 0.35))),
        ('Shoot', merge(recoil('guns', 'y', -0.05, 0.4), recoil('body', 'y', -0.02, 0.4))),
    ])
