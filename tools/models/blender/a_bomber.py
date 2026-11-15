"""Alien bomber: a wyvern with a long neck, horned head, leathery wings, glowing belly sacs and a spiked tail.

Faces +z. Pivots: 'body', 'wingL'/'wingR', 'neck', 'tail'. Clips: Idle, Run (fly), Attack (drop spores, roar).
"""

from anim import add_clips, loop
from lib import displace, empty, join, loft, slab, sphere, sweep
from rig import bob, flap, merge


def wing(s, n, body):
    w = empty(n, (s * 0.1, 0.06, 0.05), parent=body)
    pts = [(0, 0.08), (s * 0.3, 0.12), (s * 0.62, 0.0), (s * 0.66, -0.25), (s * 0.45, -0.2), (s * 0.3, -0.28), (s * 0.15, -0.18), (0, -0.15)]
    mem = slab(f'{n}Skin', pts, 0.008, 0.0, 'membrane')
    bones = [sweep(f'{n}B', [(0, 0, 0.05), (s * 0.3, 0.02, 0.12), (s * 0.62, 0.0, 0.0)], [0.03, 0.022, 0.012], 'chitinLight', segs=5)]
    bones += [sweep(f'{n}F{k}', [(s * 0.3, 0.01, 0.12), p], [0.012, 0.0], 'chitinLight', segs=4)
              for k, p in enumerate([(s * 0.66, 0.0, -0.25), (s * 0.3, 0.0, -0.28), (s * 0.15, 0.0, -0.18)])]
    join([mem], f'{n}Membrane', parent=w)
    join(bones, f'{n}Bones', parent=w)


def build():
    body = empty('body', (0, 0.4, 0))
    torso = loft('torso', [(-0.22, 0.05, 0.05, 0), (-0.1, 0.12, 0.1, 0), (0.1, 0.12, 0.1, 0.02), (0.2, 0.06, 0.06, 0.04)], 'chitin', segs=14, power=2.2)
    displace(torso, 0.01, 0.06)
    sacs = [sphere(f'sac{k}', 0.05, (x, -0.08, z), (1, 0.7, 1.2), 'glowGreen', segs=10, rings=6) for k, (x, z) in enumerate([(-0.05, 0.02), (0.05, 0.02), (0, -0.1)])]
    plates = [sweep(f'plate{k}', [(0, 0.1, 0.12 - k * 0.1), (0, 0.15, 0.1 - k * 0.1)], [0.025, 0.0], 'bone', segs=5) for k in range(4)]
    join([torso], 'torso', parent=body)
    join(plates, 'plates', parent=body)
    join(sacs, 'sacs', parent=body)
    neck = empty('neck', (0, 0.04, 0.2), parent=body)
    join([sweep('neckM', [(0, 0, 0), (0, 0.06, 0.1), (0, 0.08, 0.18)], [0.05, 0.04, 0.035], 'chitin', segs=8),
          sphere('head', 0.06, (0, 0.09, 0.24), (0.9, 0.8, 1.4), 'chitin', segs=12, rings=8)], 'neckShell', parent=neck)
    join([sweep(f'horn{s}', [(s * 0.03, 0.13, 0.22), (s * 0.06, 0.2, 0.14)], [0.015, 0.0], 'bone', segs=4) for s in (-1, 1)], 'horns', parent=neck)
    join([sphere(f'eye{s}', 0.014, (s * 0.035, 0.11, 0.29), mat='glowGreen', segs=6, rings=4) for s in (-1, 1)], 'eyes', parent=neck)
    tail = empty('tail', (0, 0.0, -0.2), parent=body)
    join([sweep('tailM', [(0, 0, 0), (0, -0.02, -0.15), (0, 0.0, -0.3), (0, 0.04, -0.42)], [0.04, 0.03, 0.018, 0.0], 'chitin', segs=6)], 'tailShell', parent=tail)
    join([sweep(f'tspike{k}', [(0, 0.02 - k * 0.0, -0.1 - k * 0.1), (0, 0.07, -0.14 - k * 0.1)], [0.012, 0.0], 'bone', segs=4) for k in range(3)], 'tailSpikes', parent=tail)
    wing(-1, 'wingL', body)
    wing(1, 'wingR', body)
    sway = {'tail': {'turn': loop([0.2, -0.2], 1.6)}, 'neck': {'turn': loop([-0.1, 0.1], 1.6)}}
    add_clips([
        ('Idle', merge(bob('body', 0.03, 1.6), flap('wingL', 'wingR', 0.3, 1.6), sway)),
        ('Run', merge(flap('wingL', 'wingR', 0.6, 0.6), bob('body', 0.03, 0.6), sway)),
        ('Attack', merge(flap('wingL', 'wingR', 0.4, 0.5), {'neck': {'pitch': [(0, 0), (0.15, 0.4), (0.35, -0.2), (0.5, 0)]}})),
    ])
