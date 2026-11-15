"""Human bomber: wide twin-boom craft with a bomb bay, four engines and a big cockpit. Faces +z."""

from lib import box, engine, fin, join, loft, slab, sphere, tube


def build():
    body = loft('body', [(-0.3, 0.1, 0.08, 0.24), (-0.1, 0.15, 0.12, 0.26), (0.2, 0.15, 0.12, 0.26),
                         (0.42, 0.1, 0.09, 0.25), (0.55, 0.03, 0.04, 0.24)], 'white', segs=18, power=3)
    wing = slab('wing', [(-0.62, -0.1), (-0.15, 0.15), (0.15, 0.15), (0.62, -0.1), (0.62, -0.24), (-0.62, -0.24)], 0.035, 0.22, 'white')
    booms = [loft(f'boom{s}', [(-0.6, 0.035, 0.035, 0.22), (-0.2, 0.05, 0.05, 0.22), (0.2, 0.045, 0.045, 0.22), (0.3, 0.01, 0.01, 0.22)], 'white', segs=12)
             for s in (-1, 1)]
    for b, s in zip(booms, (-1, 1)):
        b.location.x = s * 0.3
    tail = slab('tailplane', [(-0.36, -0.52), (0.36, -0.52), (0.36, -0.62), (-0.36, -0.62)], 0.025, 0.36, 'white')
    fins = [fin(f'fin{s}', [(-0.62, 0.22), (-0.45, 0.24), (-0.55, 0.4), (-0.64, 0.4)], 0.025, s * 0.3, 'orange') for s in (-1, 1)]
    bay = box('bay', (0.18, 0.04, 0.34), (0, 0.13, 0.06), 'dark', 0.01)
    bombs = [loft(f'bomb{i}', [(-0.08, 0.02, 0.02, 0.1), (0.0, 0.035, 0.035, 0.1), (0.08, 0.02, 0.02, 0.1)], 'red', segs=10)
             for i in range(2)]
    for b, x in zip(bombs, (-0.05, 0.05)):
        b.location.x = x
        b.location.y = -0.06
    canopy = sphere('canopy', 0.1, (0, 0.34, 0.3), (1.0, 0.55, 1.4), 'glass', segs=16, rings=10)
    shells, cores = [], []
    for x in (-0.42, -0.2, 0.2, 0.42):
        sh, core = engine(f'eng{x}', (x, 0.21, -0.12), 0.05, 0.16)
        shells += sh
        cores.append(core)
    lights = [sphere(f'tip{s}', 0.015, (s * 0.62, 0.22, -0.17), mat='glowBlue', segs=6, rings=4) for s in (-1, 1)]
    stripe = slab('stripe', [(-0.62, -0.17), (0.62, -0.17), (0.62, -0.21), (-0.62, -0.21)], 0.04, 0.22, 'orange')
    gun = tube('nosegun', (0, 0.17, 0.4), (0, 0.17, 0.62), 0.015, 0.012, 'steel', segs=8)
    join([body, wing, *booms, tail], 'hull')
    join([*fins, stripe, *shells[1::2], *bombs], 'paint')
    join([bay, gun, *shells[0::2]], 'metal')
    join([canopy], 'canopy')
    join([*cores, *lights], 'glow')
