"""Diamond crystal cluster for deposits: about 1.6 wide. Slot 'crystal' is the glowing crystal."""

import math

import bmesh
from mathutils import Matrix, Vector

from lib import displace, g, join, obj_from_bmesh, sphere


def prism(name, base, height, radius, tilt_x, tilt_z):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=6, radius1=radius, radius2=radius * 0.85, depth=height * 0.8)
    bmesh.ops.translate(bm, verts=bm.verts, vec=(0, 0, height * 0.4))
    tip = bmesh.ops.create_cone(bm, cap_ends=True, segments=6, radius1=radius * 0.85, radius2=0.0, depth=height * 0.2)
    bmesh.ops.translate(bm, verts=tip['verts'], vec=(0, 0, height * 0.9))
    rot = Matrix.Rotation(tilt_x, 4, 'X') @ Matrix.Rotation(tilt_z, 4, 'Y')
    bmesh.ops.transform(bm, matrix=Matrix.Translation(g(*base)) @ rot, verts=bm.verts)
    return obj_from_bmesh(name, bm, 'crystal', smooth=False)


def build():
    shards = []
    for i in range(11):
        r = (i / 11) * 0.7
        a = i * 2.1
        h = 0.45 + ((i * 7) % 5) * 0.14
        shards.append(prism(f'shard{i}', (math.cos(a) * r, -0.05, math.sin(a) * r), h, 0.07 + (i % 3) * 0.035,
                            math.sin(i * 1.7) * 0.45, math.cos(i * 1.3) * 0.45))
    rock = sphere('bed', 0.75, (0, -0.05, 0), (1.1, 0.22, 1), 'rock', segs=20, rings=8)
    displace(rock, 0.06, 0.15)
    join(shards, 'crystal')
    join([rock], 'bed')
