"""Human flak walker: cockpit body on two strong legs, twin anti-air cannons that point up. About 0.9 high. Faces +z.

Pivots: 'body', 'legL'/'legR', 'guns'. Clips: Idle, Walk, Shoot.
"""

from anim import add_clips
from lib import box, empty, join, loft, sphere, tube
from rig import bob, limb, merge, recoil, walk


def build():
    body = empty('body', (0, 0.5, 0))
    cab = loft('cab', [(-0.2, 0.18, 0.12, 0.12), (-0.1, 0.22, 0.15, 0.14), (0.12, 0.2, 0.13, 0.14), (0.22, 0.12, 0.08, 0.12)],
               'white', segs=16, power=4)
    window = box('window', (0.22, 0.05, 0.02), (0, 0.18, 0.21), 'glass')
    stripes = [box(f'stripe{s}', (0.02, 0.05, 0.3), (s * 0.21, 0.12, 0), 'orange') for s in (-1, 1)]
    hip = box('hip', (0.34, 0.06, 0.14), (0, 0.0, 0), 'dark', 0.01)
    lights = [sphere(f'lamp{s}', 0.018, (s * 0.15, 0.08, 0.22), mat='window', segs=6, rings=4) for s in (-1, 1)]
    join([cab], 'cabWhite', parent=body)
    join(stripes, 'cabPaint', parent=body)
    join([hip], 'cabDark', parent=body)
    join([window], 'cabGlass', parent=body)
    join(lights, 'cabGlow', parent=body)
    guns = empty('guns', (0, 0.3, -0.02), parent=body)
    mount = [box('mount', (0.3, 0.08, 0.14), (0, 0, 0), 'steel', 0.015)]
    barrels, tips = [], []
    for s in (-1, 1):
        for k in (-1, 1):
            x = s * 0.1 + k * 0.025
            barrels.append(tube(f'barrel{s}{k}', (x, 0.02, 0.0), (x, 0.2, 0.25), 0.018, 0.015, 'dark', segs=8))
            tips.append(sphere(f'tip{s}{k}', 0.013, (x, 0.205, 0.257), mat='glowYellow', segs=6, rings=4))
    join([*mount, *barrels], 'gunMetal', parent=guns)
    join(tips, 'gunGlow', parent=guns)
    for s, n in ((-1, 'legL'), (1, 'legR')):
        foot = [box(f'{n}Foot', (0.12, 0.05, 0.2), (0, -0.47, 0.03), 'dark', 0.015)]
        knee = [box(f'{n}Knee', (0.09, 0.08, 0.06), (0, -0.22, 0.09), 'orange', 0.01)]
        limb(n, (s * 0.16, 0.5, 0), [(0, 0, 0), (0, -0.22, 0.07), (0, -0.45, 0.0)], [0.06, 0.05, 0.045], 'steel',
             extra=[foot, knee], joint_mat='white')
    add_clips([
        ('Idle', merge(bob('body', 0.01, 2.0), {'guns': {'turn': [(0, 0), (1, 0.3), (2, 0), (3, -0.3), (4, 0)]}})),
        ('Walk', walk('legL', 'legR', swing=0.4, length=0.8, body='body', bob=0.03)),
        ('Shoot', merge(recoil('guns', 'z', -0.05, 0.35), recoil('body', 'y', -0.01, 0.35))),
    ])
