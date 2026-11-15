"""Human landing pad under every building: 2 x 2 tiles, top at y = 0.1 (like the Kenney platform).

Panel plates with seams, an orange edge with hazard marks, corner posts with lamps, bolts and vents.
The game scales it on x/z to the building size (specs-helpers.ts, pad()).
"""

import math

from lib import box, join, sphere

H = 0.1


def build():
    base = box('base', (2.0, H * 0.7, 2.0), (0, H * 0.35, 0), 'steel', 0.01)
    plates, seams = [], []
    for i in range(3):
        for j in range(3):
            x, z = -0.62 + i * 0.62, -0.62 + j * 0.62
            plates.append(box(f'plate{i}{j}', (0.58, 0.03, 0.58), (x, H - 0.015, z), 'white', 0.006))
    edge = []
    for s in (-1, 1):
        edge.append(box(f'edgeX{s}', (2.0, 0.05, 0.08), (0, H - 0.02, s * 0.96), 'orange'))
        edge.append(box(f'edgeZ{s}', (0.08, 0.05, 2.0), (s * 0.96, H - 0.02, 0), 'orange'))
    marks = []
    for k in range(8):
        t = -0.84 + k * 0.24
        for s in (-1, 1):
            marks.append(box(f'markX{k}{s}', (0.08, 0.052, 0.082), (t, H - 0.02, s * 0.96), 'dark'))
            marks.append(box(f'markZ{k}{s}', (0.082, 0.052, 0.08), (s * 0.96, H - 0.02, t), 'dark'))
    posts, lamps = [], []
    for sx in (-1, 1):
        for sz in (-1, 1):
            posts.append(box(f'post{sx}{sz}', (0.1, 0.08, 0.1), (sx * 0.93, H + 0.02, sz * 0.93), 'steel', 0.01))
            lamps.append(sphere(f'lamp{sx}{sz}', 0.025, (sx * 0.93, H + 0.07, sz * 0.93), mat='window', segs=8, rings=5))
    for k in range(4):
        a = k / 4 * math.tau + math.pi / 4
        seams.append(box(f'vent{k}', (0.16, 0.02, 0.05), (math.cos(a) * 0.62, H + 0.003, math.sin(a) * 0.62), 'dark'))
    join([base, *posts], 'frame')
    join(plates, 'plates')
    join([*edge], 'edge')
    join([*marks, *seams], 'marks')
    join(lamps, 'lamps')
