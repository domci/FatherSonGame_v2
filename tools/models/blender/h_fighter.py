"""Human air fighter: slim body, delta wings, glass cockpit, twin engines, wing-tip lasers. Faces +z."""

from lib import box, engine, fin, join, loft, slab, sphere, tube


def build():
    body = loft('body', [(-0.48, 0.07, 0.06, 0.2), (-0.3, 0.1, 0.08, 0.2), (0.0, 0.1, 0.085, 0.21),
                         (0.25, 0.08, 0.07, 0.2), (0.42, 0.04, 0.04, 0.19), (0.52, 0.005, 0.005, 0.185)], 'white', segs=16)
    wing = slab('wing', [(-0.5, -0.36), (-0.12, 0.2), (0.12, 0.2), (0.5, -0.36), (0.44, -0.42), (-0.44, -0.42)], 0.025, 0.17, 'white')
    stripes = [slab(f'stripe{s}', [(s * 0.3, -0.18), (s * 0.4, -0.31), (s * 0.44, -0.29), (s * 0.34, -0.16)], 0.03, 0.17, 'orange') for s in (-1, 1)]
    tails = [fin(f'tail{s}', [(-0.46, 0.22), (-0.3, 0.24), (-0.4, 0.42), (-0.48, 0.42)], 0.02, s * 0.08, 'white') for s in (-1, 1)]
    canopy = sphere('canopy', 0.07, (0, 0.27, 0.14), (0.8, 0.6, 2.0), 'glass', segs=16, rings=10)
    frame = box('canopyFrame', (0.012, 0.02, 0.24), (0, 0.31, 0.12), 'steel')
    shells, cores = [], []
    for s in (-1, 1):
        sh, core = engine(f'eng{s}', (s * 0.07, 0.19, -0.36), 0.045, 0.16)
        shells += sh
        cores.append(core)
    guns = []
    for s in (-1, 1):
        guns.append(tube(f'gun{s}', (s * 0.47, 0.17, -0.3), (s * 0.47, 0.17, 0.05), 0.016, 0.012, 'steel', segs=8))
        cores.append(sphere(f'muzzle{s}', 0.012, (s * 0.47, 0.17, 0.06), mat='glowBlue', segs=6, rings=4))
    intake = [box(f'intake{s}', (0.05, 0.05, 0.14), (s * 0.11, 0.17, 0.05), 'dark', 0.01) for s in (-1, 1)]
    join([body, wing, *tails], 'hull')
    join([*stripes, *shells[1::2]], 'paint')
    join([frame, *shells[0::2], *guns, *intake], 'metal')
    join([canopy], 'canopy')
    join(cores, 'glow')
