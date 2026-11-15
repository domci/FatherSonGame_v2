"""Human soldier in a space suit with a laser rifle. About 1 high, faces +z.

Pivots: 'body' (torso, head, arms), 'legL'/'legR' (hips), 'armL'/'armR' (shoulders). Clips: Idle, Run, Shoot.
"""

from anim import add_clips
from lib import box, empty, join, loft, sphere, tube
from rig import bob, limb, merge, recoil, walk


def torso(body):
    suit = loft('suit', [(-0.08, 0.1, 0.09, 0.05), (0.0, 0.13, 0.11, 0.18), (0.02, 0.14, 0.11, 0.28), (0.0, 0.11, 0.08, 0.36)],
                'white', segs=14, power=2.5)
    chest = box('chest', (0.18, 0.08, 0.04), (0, 0.24, 0.1), 'orange', 0.01)
    pack = box('pack', (0.2, 0.24, 0.1), (0, 0.22, -0.13), 'steel', 0.015)
    tanks = [tube(f'tank{s}', (s * 0.06, 0.1, -0.19), (s * 0.06, 0.34, -0.19), 0.035, 0.035, 'white', segs=10) for s in (-1, 1)]
    belt = box('belt', (0.22, 0.04, 0.18), (0, 0.05, 0), 'dark', 0.01)
    helmet = sphere('helmet', 0.11, (0, 0.47, 0), mat='white', segs=18, rings=12)
    visor = sphere('visor', 0.085, (0, 0.47, 0.04), (1.05, 0.75, 0.9), 'dark', segs=16, rings=10)
    glow = [sphere('visorGlow', 0.02, (0.03, 0.5, 0.11), mat='glowBlue', segs=6, rings=4),
            sphere('packLight', 0.015, (0.07, 0.32, -0.19), mat='window', segs=6, rings=4)]
    join([suit, helmet, *tanks], 'torsoWhite', parent=body)
    join([chest], 'torsoPaint', parent=body)
    join([pack, belt, visor], 'torsoDark', parent=body)
    join(glow, 'torsoGlow', parent=body)


def arms(body):
    rifle = [box('rifle', (0.04, 0.06, 0.32), (0.0, -0.22, 0.12), 'dark', 0.008),
             tube('barrel', (0.0, -0.2, 0.28), (0.0, -0.2, 0.36), 0.012, 0.01, 'steel', segs=8),
             box('rifleStripe', (0.042, 0.015, 0.1), (0.0, -0.19, 0.08), 'orange')]
    muzzle = [sphere('muzzle', 0.014, (0.0, -0.2, 0.37), mat='glowBlue', segs=6, rings=4)]
    limb('armR', (0.15, 0.3, 0), [(0, 0, 0), (0.01, -0.13, 0.04), (-0.02, -0.22, 0.1)], [0.04, 0.035, 0.03], 'white',
         parent=body, extra=[rifle, muzzle], joint_mat='steel')
    glove = [sphere('gloveL', 0.035, (0.02, -0.22, 0.12), mat='dark', segs=8, rings=6)]
    limb('armL', (-0.15, 0.3, 0), [(0, 0, 0), (0.0, -0.13, 0.05), (0.03, -0.21, 0.12)], [0.04, 0.035, 0.03], 'white',
         parent=body, extra=[glove], joint_mat='steel')


def legs():
    for s, n in ((-1, 'legL'), (1, 'legR')):
        boot = [box(f'boot{n}', (0.09, 0.07, 0.15), (0, -0.4, 0.025), 'dark', 0.015)]
        knee = [box(f'knee{n}', (0.07, 0.05, 0.03), (0, -0.2, 0.05), 'orange', 0.008)]
        limb(n, (s * 0.07, 0.45, 0), [(0, 0, 0), (0, -0.2, 0.01), (0, -0.37, 0)], [0.055, 0.048, 0.042], 'white', extra=[boot, knee])


def build():
    body = empty('body', (0, 0.45, 0))
    torso(body)
    arms(body)
    legs()
    add_clips([
        ('Idle', bob('body', 0.008, 2.4)),
        ('Run', walk('legL', 'legR', swing=0.55, length=0.55, body='body', bob=0.02)),
        ('Shoot', merge(recoil('armR', 'z', -0.03, 0.4), recoil('body', 'z', -0.01, 0.4))),
    ])
