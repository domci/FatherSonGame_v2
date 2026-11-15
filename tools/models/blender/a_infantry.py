"""Alien warrior: hunched chitin biped with long clawed arms, a crested head with three glowing eyes, and a tail.

About 1 high, faces +z. Pivots: 'body', 'legL'/'legR', 'armL'/'armR', 'tail'. Clips: Idle, Run, Attack (claw swipe).
"""

from anim import add_clips, loop
from lib import displace, empty, join, loft, sphere, sweep
from rig import bob, limb, merge, walk


def build():
    body = empty('body', (0, 0.45, 0))
    torso = loft('torso', [(-0.1, 0.08, 0.08, 0.06), (-0.02, 0.13, 0.12, 0.18), (0.06, 0.12, 0.11, 0.3), (0.1, 0.07, 0.06, 0.38)],
                 'chitin', segs=14, power=2.2)
    displace(torso, 0.01, 0.05)
    head = sphere('head', 0.09, (0, 0.44, 0.13), (0.9, 0.8, 1.3), 'chitin', segs=14, rings=10)
    crest = sweep('crest', [(0, 0.5, 0.05), (0, 0.6, 0.0), (0, 0.62, -0.1)], [0.03, 0.02, 0.0], 'bone', segs=6)
    jaw = sphere('jaw', 0.05, (0, 0.39, 0.22), (1, 0.6, 1), 'chitinLight', segs=10, rings=6)
    spines = [sweep(f'spine{k}', [(0, 0.34 - k * 0.09, -0.08), (0, 0.38 - k * 0.09, -0.16)], [0.018, 0.0], 'bone', segs=5) for k in range(3)]
    eyes = [sphere(f'eye{i}', 0.018 if i else 0.024, p, mat='glowGreen', segs=8, rings=5)
            for i, p in enumerate([(0, 0.47, 0.24), (0.04, 0.45, 0.22), (-0.04, 0.45, 0.22)])]
    veins = [sweep(f'vein{s}', [(s * 0.09, 0.12, 0.08), (s * 0.12, 0.22, 0.1), (s * 0.08, 0.32, 0.08)], [0.01, 0.01, 0.0], 'glowViolet', segs=4) for s in (-1, 1)]
    join([torso, head], 'bodyShell', parent=body)
    join([jaw], 'bodyLight', parent=body)
    join([crest, *spines], 'bodyBone', parent=body)
    join([*eyes, *veins], 'bodyGlow', parent=body)
    for s, n in ((-1, 'armL'), (1, 'armR')):
        claws = [sweep(f'{n}Claw{k}', [(0, -0.36, 0.1), (k * 0.02, -0.44, 0.16), (k * 0.03, -0.46, 0.2)], [0.012, 0.008, 0.0], 'bone', segs=4)
                 for k in (-1, 0, 1)]
        limb(n, (s * 0.15, 0.32, 0.08), [(0, 0, 0), (s * 0.04, -0.18, 0.02), (0, -0.36, 0.1)], [0.04, 0.03, 0.025], 'chitinLight',
             parent=body, extra=[claws], joint_mat='chitin')
    for s, n in ((-1, 'legL'), (1, 'legR')):
        toes = [sweep(f'{n}Toe{k}', [(0, -0.4, 0.0), (k * 0.03, -0.44, 0.08)], [0.015, 0.0], 'bone', segs=4) for k in (-1, 1)]
        limb(n, (s * 0.08, 0.45, 0), [(0, 0, 0), (0, -0.2, 0.08), (0, -0.4, 0.0)], [0.05, 0.04, 0.03], 'chitinLight', extra=[toes], joint_mat='chitin')
    tail = empty('tail', (0, 0.05, -0.08), parent=body)
    join([sweep('tailMesh', [(0, 0, 0), (0, -0.1, -0.15), (0, -0.2, -0.3), (0, -0.25, -0.42)], [0.04, 0.03, 0.018, 0.0], 'chitin', segs=6)],
         'tailBody', parent=tail)
    swing = {'tail': {'turn': loop([0.25, -0.25], 1.2)}}
    add_clips([
        ('Idle', merge(bob('body', 0.012, 2.2), swing)),
        ('Run', merge(walk('legL', 'legR', swing=0.6, length=0.5, body='body', bob=0.025, arms=('armL', 'armR')), swing)),
        ('Attack', merge(swing, {'armR': {'pitch': [(0, 0), (0.15, -1.1), (0.3, 0.3), (0.6, 0)]},
                                 'armL': {'pitch': [(0, 0), (0.3, 0), (0.45, -1.0), (0.6, 0)]}})),
    ])
