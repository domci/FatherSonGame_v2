"""Human hunter robot: two bent legs, armored body, sensor head with orange visor, net gun arm. Faces +z.

Pivots: 'body', 'legL'/'legR', 'gun'. Clips: Idle, Run, Shoot.
"""

from anim import add_clips
from lib import box, empty, join, loft, sphere, tube
from rig import bob, limb, merge, recoil, walk


def build():
    body = empty('body', (0, 0.42, 0))
    torso = loft('torso', [(-0.12, 0.1, 0.1, 0.12), (-0.04, 0.14, 0.13, 0.14), (0.08, 0.13, 0.11, 0.14), (0.13, 0.08, 0.07, 0.12)],
                 'white', segs=14, power=3)
    head = box('head', (0.14, 0.09, 0.12), (0, 0.32, 0.04), 'white', 0.02)
    visor = box('visor', (0.12, 0.03, 0.02), (0, 0.33, 0.1), 'glowYellow')
    plate = box('plate', (0.2, 0.05, 0.03), (0, 0.18, 0.13), 'orange', 0.008)
    pack = box('pack', (0.16, 0.14, 0.08), (0, 0.18, -0.13), 'steel', 0.012)
    hip = box('hip', (0.2, 0.05, 0.1), (0, 0.02, 0), 'dark', 0.01)
    join([torso, head], 'bodyWhite', parent=body)
    join([plate], 'bodyPaint', parent=body)
    join([pack, hip], 'bodyMetal', parent=body)
    join([visor], 'bodyGlow', parent=body)
    gun = empty('gun', (0.17, 0.18, 0.02), parent=body)
    barrel = [tube('gunBody', (0, 0, -0.08), (0, 0, 0.18), 0.04, 0.035, 'dark', segs=10),
              tube('gunTip', (0, 0, 0.18), (0, 0, 0.26), 0.05, 0.03, 'steel', segs=10)]
    join(barrel, 'gunMesh', parent=gun)
    join([sphere('gunGlow', 0.018, (0, 0, 0.27), mat='glowBlue', segs=6, rings=4)], 'gunLight', parent=gun)
    for s, n in ((-1, 'legL'), (1, 'legR')):
        foot = [box(f'{n}Foot', (0.08, 0.04, 0.14), (0, -0.39, 0.04), 'dark', 0.01)]
        limb(n, (s * 0.08, 0.42, 0), [(0, 0, 0), (0, -0.18, 0.08), (0, -0.38, 0.0)], [0.045, 0.035, 0.03], 'steel',
             extra=[foot], joint_mat='orange')
    add_clips([
        ('Idle', bob('body', 0.01, 2.0)),
        ('Run', walk('legL', 'legR', swing=0.5, length=0.5, body='body', bob=0.02)),
        ('Shoot', merge(recoil('gun', 'z', -0.06, 0.5), recoil('body', 'z', -0.015, 0.5))),
    ])
