"""Alien pod: egg-shaped chitin shell with lobes, growth bands, glowing veins and pores.

Size: radius 1, height 2, bottom at y = 0. The game scales it (alien-helpers.ts, pod()).
Material 'shell' gets the pod's material in the game (chitin, chitinLight, fleshDark).
"""

import math

import bmesh

from lib import join, obj_from_bmesh, sphere, sweep

LOBES = 8


def radius_at(y, phi):
    """Shell radius at height y (0..2) and angle phi."""
    t = y / 2
    u = y - 1
    egg = math.sqrt(max(0.0, 1 - u * u)) * (1 - 0.14 * u)
    lobes = 1 + 0.045 * math.cos(LOBES * phi)
    bands = 1 - 0.025 * math.sin(t * math.pi * 7) ** 8
    return max(0.02, egg * lobes * bands)


def shell():
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=48, v_segments=24, radius=1)
    for v in bm.verts:
        y = v.co.z + 1
        phi = math.atan2(v.co.y, v.co.x)
        flat = math.hypot(v.co.x, v.co.y)
        r = radius_at(y, phi) if flat > 1e-6 else 0
        v.co.x = math.cos(phi) * r * (flat > 1e-6)
        v.co.y = math.sin(phi) * r * (flat > 1e-6)
        v.co.z = y
    return obj_from_bmesh('shell', bm, 'shell')


def surface_point(y, phi, out=0.015):
    r = radius_at(y, phi) + out
    return (math.cos(phi) * r, y, -math.sin(phi) * r)


def veins():
    out = []
    for k in range(5):
        phi0 = k / 5 * math.tau + 0.35
        pts = [surface_point(0.1 + i * 0.17, phi0 + math.sin(i * 1.3 + k) * 0.14) for i in range(8)]
        radii = [0.035 - i * 0.0035 for i in range(7)] + [0.0]
        out.append(sweep(f'vein{k}', pts, radii, 'glowGreen', segs=6))
    return out


def ridges():
    """Raised chitin seams between the lobes."""
    out = []
    for k in range(LOBES):
        phi = (k + 0.5) / LOBES * math.tau
        pts = [surface_point(0.15 + i * 0.25, phi, 0.0) for i in range(7)]
        out.append(sweep(f'ridge{k}', pts, [0.03, 0.04, 0.045, 0.04, 0.035, 0.025, 0.0], 'chitinLight', segs=6))
    return out


def pores():
    out = []
    for k in range(7):
        phi = k / 7 * math.tau + 0.1
        x, y, z = surface_point(0.32 + (k % 2) * 0.12, phi, -0.02)
        out.append(sphere(f'pore{k}', 0.06, (x, y, z), mat='glowGreen', segs=8, rings=6))
    return out


def build():
    shell()
    join(veins() + pores(), 'glow')
    join(ridges(), 'ridges')
