"""Alien air fighter: a bat creature with big membrane wings, ears, glowing eyes and a tail. Faces +z.

Pivots: 'body', 'wingL'/'wingR'. Clips: Idle (glide), Run (fast flaps), Attack (dive bite).
"""

from anim import add_clips
from lib import empty, join, slab, sphere, sweep
from rig import bob, flap, merge


def wing(s, n, body):
    w = empty(n, (s * 0.08, 0.04, 0.0), parent=body)
    bones = [(s * 0.2, 0.06, 0.05), (s * 0.42, 0.04, -0.02), (s * 0.48, 0.0, -0.18)]
    arm = sweep(f'{n}Arm', [(0, 0, 0), *bones[:2]], [0.02, 0.016, 0.01], 'chitinLight', segs=5)
    fingers = [sweep(f'{n}F{k}', [bones[1], p], [0.01, 0.0], 'chitinLight', segs=4)
               for k, p in enumerate([(s * 0.48, 0.0, -0.18), (s * 0.34, 0.0, -0.22), (s * 0.2, 0.0, -0.18)])]
    mem = slab(f'{n}Skin', [(0, 0.04), (s * 0.2, 0.05), (s * 0.42, -0.02), (s * 0.48, -0.18), (s * 0.34, -0.22), (s * 0.2, -0.18), (0, -0.12)],
               0.006, 0.0, 'membrane')
    join([arm, *fingers], f'{n}Bones', parent=w)
    join([mem], f'{n}Membrane', parent=w)


def build():
    body = empty('body', (0, 0.35, 0))
    torso = sphere('torso', 0.09, (0, 0, 0), (0.9, 0.8, 1.5), 'fleshDark', segs=14, rings=10)
    head = sphere('head', 0.065, (0, 0.03, 0.14), (1, 0.9, 1), 'chitin', segs=12, rings=8)
    ears = [sweep(f'ear{s}', [(s * 0.03, 0.08, 0.13), (s * 0.06, 0.16, 0.1)], [0.025, 0.0], 'chitin', segs=5) for s in (-1, 1)]
    fangs = [sweep(f'fang{s}', [(s * 0.015, -0.01, 0.19), (s * 0.012, -0.05, 0.2)], [0.008, 0.0], 'bone', segs=4) for s in (-1, 1)]
    tail = sweep('tail', [(0, 0, -0.12), (0, 0.02, -0.25), (0, 0.06, -0.33)], [0.025, 0.012, 0.0], 'chitin', segs=5)
    eyes = [sphere(f'eye{s}', 0.016, (s * 0.03, 0.05, 0.19), mat='glowGreen', segs=6, rings=4) for s in (-1, 1)]
    join([torso], 'torso', parent=body)
    join([head, *ears, tail], 'headShell', parent=body)
    join(fangs, 'fangs', parent=body)
    join(eyes, 'eyes', parent=body)
    wing(-1, 'wingL', body)
    wing(1, 'wingR', body)
    add_clips([
        ('Idle', merge(bob('body', 0.03, 1.4), flap('wingL', 'wingR', 0.35, 1.4))),
        ('Run', merge(flap('wingL', 'wingR', 0.7, 0.4), bob('body', 0.02, 0.4))),
        ('Attack', merge(flap('wingL', 'wingR', 0.5, 0.3), {'body': {'pitch': [(0, 0), (0.15, -0.4), (0.3, 0)]}})),
    ])
