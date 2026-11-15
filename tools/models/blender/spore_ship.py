"""Alien living ship (transport; the cruiser is a bigger copy). Faces +z in the game.

Like a squid made of chitin: a long lobed body with a tail, ribs from front to back,
a glowing eye and belly sac, membrane wings and tentacles that trail behind.
About 0.7 wide, 1.2 long.
"""

import math

import bmesh

from lib import displace, g, join, obj_from_bmesh, sphere, sweep

LENGTH = 0.62  # half length


def body_radius(u):
    """Radius along the body, u = -1 (tail) .. 1 (nose)."""
    return 0.3 * math.sqrt(max(0.0, 1 - u * u)) * (0.75 + 0.35 * (u + 1) / 2)


def body():
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=36, v_segments=22, radius=1)
    for v in bm.verts:
        u = v.co.z  # along the length
        phi = math.atan2(v.co.y, v.co.x)
        flat = math.hypot(v.co.x, v.co.y)
        r = body_radius(u) * (1 + 0.06 * math.cos(6 * phi)) * (flat > 1e-6)
        # Game coordinates: x side, y up, z front.
        x, y, z = math.cos(phi) * r, math.sin(phi) * r * 0.8 + 0.3, u * LENGTH
        v.co = g(x, y, z)
    ob = obj_from_bmesh('body', bm, 'chitin')
    displace(ob, 0.015, 0.1)
    return ob


def ribs():
    out = []
    for k in range(5):
        phi = math.pi * (0.15 + k * 0.175)  # over the top half
        pts = []
        for i in range(9):
            u = -0.9 + i * 0.225
            r = body_radius(u) * 1.02 + 0.01
            pts.append((math.cos(phi) * r, math.sin(phi) * r * 0.8 + 0.3, u * LENGTH))
        out.append(sweep(f'rib{k}', pts, [0.0, 0.02, 0.028, 0.03, 0.03, 0.028, 0.024, 0.016, 0.0], 'chitinLight', segs=6))
    return out


def tentacles():
    out = []
    for k in range(6):
        a = k / 6 * math.tau
        x0, y0 = math.cos(a) * 0.1, 0.3 + math.sin(a) * 0.08
        pts = []
        for i in range(6):
            wob = math.sin(i * 1.3 + k * 2) * 0.05
            pts.append((x0 * (1 + i * 0.3) + wob, y0 - i * 0.035, -LENGTH * 0.85 - i * 0.12))
        out.append(sweep(f'tent{k}', pts, [0.035, 0.03, 0.022, 0.015, 0.008, 0.0], 'fleshDark', segs=6))
    return out


def wing(side):
    """A thin membrane wing with a bony spine at its front edge."""
    edge = [(side * 0.24, 0.32, 0.25), (side * 0.52, 0.36, 0.0), (side * 0.6, 0.34, -0.28), (side * 0.5, 0.3, -0.42)]
    root = [(side * 0.24, 0.3, -0.3), (side * 0.27, 0.31, -0.05)]
    bm = bmesh.new()
    verts = [bm.verts.new(g(*p)) for p in edge + root]
    bm.faces.new(verts if side < 0 else list(reversed(verts)))
    membrane = obj_from_bmesh(f'wing{side}', bm, 'membrane', smooth=False)
    spine = sweep(f'spine{side}', edge, [0.025, 0.02, 0.014, 0.0], 'chitinLight', segs=5)
    struts = [sweep(f'strut{side}{i}', [(side * 0.26, 0.31, -0.1 * i), p], [0.012, 0.006], 'chitinLight', segs=4)
              for i, p in enumerate(edge[1:3])]
    return membrane, [spine, *struts]


def glow():
    eye = sphere('eye', 0.08, (0, 0.36, LENGTH * 0.88), (1.2, 0.8, 0.7), 'glowGreen', segs=14, rings=8)
    sac = sphere('sac', 0.16, (0, 0.12, 0.0), (0.9, 0.4, 1.6), 'glowGreen', segs=18, rings=10)
    spots = [sphere(f'spot{k}{s}', 0.028, (s * 0.2, 0.42, 0.3 - k * 0.2), mat='glowGreen', segs=8, rings=5)
             for k in range(4) for s in (-1, 1)]
    return [eye, sac, *spots]


def build():
    wings = [wing(-1), wing(1)]
    join([body(), *ribs(), *tentacles(), *[p for _, parts in wings for p in parts]], 'hull')
    join([m for m, _ in wings], 'wings')
    join(glow(), 'glow')
