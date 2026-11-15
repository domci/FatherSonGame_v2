"""Pivot-based rigs shared by animated units: legs, arms, wings, and their standard clips.

Each limb is an empty (pivot) with rigid meshes under it, built in the pivot's own space.
"""

import math

from anim import loop
from lib import empty, join, sphere, sweep


def limb(name, pivot_pos, points, radii, mat, parent=None, extra=None, joint_mat=None):
    """A pivot at pivot_pos with one tube through `points` (in pivot space) and optional extra meshes."""
    pivot = empty(name, pivot_pos, parent=parent)
    parts = [sweep(f'{name}Tube', points, radii, mat, segs=8)]
    if joint_mat:
        parts += [sphere(f'{name}J{i}', radii[i] * 1.25, p, mat=joint_mat, segs=8, rings=6) for i, p in enumerate(points[:-1])]
    join(parts, f'{name}Mesh', parent=pivot)
    for i, group in enumerate(extra or []):
        join(group, f'{name}Extra{i}', parent=pivot)
    return pivot


def walk(left, right, swing=0.6, length=0.6, body=None, bob=0.03, arms=None):
    """Two-leg walk: legs swing opposite, arms opposite to legs, body bobs twice per step."""
    tracks = {
        left: {'pitch': loop([swing, 0, -swing, 0], length)},
        right: {'pitch': loop([-swing, 0, swing, 0], length)},
    }
    if arms:
        tracks[arms[0]] = {'pitch': loop([-swing * 0.7, 0, swing * 0.7, 0], length)}
        tracks[arms[1]] = {'pitch': loop([swing * 0.7, 0, -swing * 0.7, 0], length)}
    if body:
        tracks[body] = {'y': loop([0, bob, 0, bob], length)}
    return tracks


def breathe(name, amount=0.015, length=2.0):
    return {name: {'y': loop([0, amount], length)}}


def flap(left, right, angle=0.7, length=0.4):
    """Wings beat up and down (left wing on -x)."""
    return {
        left: {'roll': loop([angle, -angle * 0.6], length)},
        right: {'roll': loop([-angle, angle * 0.6], length)},
    }


def legs_walk(names, swing=0.35, length=0.5):
    """Many legs (crab, insect): alternate groups swing around the up axis and lift."""
    tracks = {}
    for i, n in enumerate(names):
        phase = 0 if i % 2 == 0 else 2
        vals = [swing, 0, -swing, 0]
        vals = vals[phase:] + vals[:phase]
        tracks[n] = {'turn': loop(vals, length)}
    return tracks


def recoil(name, axis='z', amount=-0.06, length=0.6):
    return {name: {axis: [(0, 0), (0.05, amount), (length * 0.6, 0), (length, 0)]}}


def bob(name, amount=0.04, length=1.6):
    return {name: {'y': loop([0, amount, 0, -amount], length)}}


def tilt(name, angle=0.25, length=0.8):
    return {name: {'pitch': loop([angle, angle * 0.9], length)}}


def merge(*tracks):
    out = {}
    for t in tracks:
        for k, v in t.items():
            out.setdefault(k, {}).update(v)
    return out


__all__ = ['limb', 'walk', 'breathe', 'flap', 'legs_walk', 'recoil', 'bob', 'tilt', 'merge', 'math']
