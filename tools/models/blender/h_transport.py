"""Human transport: chunky cargo lander with cockpit, cargo modules, landing legs and lift jets. Faces +z."""

from lib import box, engine, join, loft, sphere, sweep


def build():
    hull = loft('hull', [(-0.5, 0.2, 0.14, 0.32), (-0.3, 0.25, 0.17, 0.33), (0.25, 0.25, 0.17, 0.33),
                         (0.45, 0.18, 0.13, 0.32), (0.55, 0.08, 0.07, 0.3)], 'white', segs=20, power=4)
    cockpit = sphere('cockpit', 0.12, (0, 0.46, 0.36), (1.1, 0.5, 1.0), 'glass', segs=16, rings=8)
    pods, paint, metal, glow = [], [], [], []
    for s in (-1, 1):
        pods.append(box(f'cargo{s}', (0.16, 0.18, 0.5), (s * 0.34, 0.3, -0.05), 'white', 0.02))
        paint.append(box(f'band{s}', (0.17, 0.05, 0.08), (s * 0.34, 0.3, 0.12), 'orange'))
        paint.append(box(f'band2{s}', (0.17, 0.05, 0.08), (s * 0.34, 0.3, -0.22), 'orange'))
        for z in (-0.3, 0.25):
            metal.append(sweep(f'leg{s}{z}', [(s * 0.22, 0.2, z), (s * 0.34, 0.06, z), (s * 0.36, 0.0, z)], [0.02, 0.016, 0.012], 'steel'))
            metal.append(box(f'foot{s}{z}', (0.1, 0.02, 0.1), (s * 0.36, 0.01, z), 'dark'))
        for z in (-0.25, 0.2):
            metal.append(box(f'jet{s}{z}', (0.08, 0.04, 0.08), (s * 0.34, 0.19, z), 'dark'))
            glow.append(sphere(f'jetGlow{s}{z}', 0.03, (s * 0.34, 0.17, z), (1, 0.4, 1), 'glowBlue', segs=8, rings=4))
        glow.append(sphere(f'nav{s}', 0.018, (s * 0.43, 0.4, 0.2), mat='glowYellow' if s < 0 else 'glowBlue', segs=6, rings=4))
    for x in (-0.12, 0.12):
        sh, core = engine(f'eng{x}', (x, 0.33, -0.48), 0.07, 0.12)
        metal.append(sh[0])
        paint.append(sh[1])
        glow.append(core)
    metal.append(box('ramp', (0.22, 0.02, 0.2), (0, 0.16, 0.42), 'dark'))
    metal.append(box('antenna', (0.01, 0.12, 0.01), (0.08, 0.55, -0.2), 'steel'))
    paint.append(box('roofStripe', (0.06, 0.02, 0.6), (0, 0.5, -0.05), 'orange'))
    join([hull, *pods], 'hull')
    join(paint, 'paint')
    join(metal, 'metal')
    join([cockpit], 'canopy')
    join(glow, 'glow')
