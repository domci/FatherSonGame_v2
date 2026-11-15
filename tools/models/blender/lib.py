"""Small helpers for building game models with Blender (bpy), headless.

Coordinates: helpers take GAME coordinates (three.js: x right, y up, z to the front).
`g(x, y, z)` turns them into Blender coordinates (z up, front = -y). The glTF exporter
turns them back, so a model built here faces +z in the game.

Material names must be game material names (see src/render/models/parts.ts, MaterialName)
or a slot name the game maps in code (for example 'shell' on pods). The game replaces
every material by name, so colors here are only for previews in Blender.
"""

import math

import bpy  # first: bmesh and mathutils come with bpy
import bmesh
from mathutils import Matrix, Vector

# Preview colors (r, g, b, emission strength). The game uses its own materials.
PREVIEW = {
    'steel': (0.49, 0.53, 0.58, 0),
    'white': (0.91, 0.92, 0.93, 0),
    'orange': (0.91, 0.53, 0.23, 0),
    'dark': (0.23, 0.25, 0.28, 0),
    'domeGlass': (0.84, 0.94, 1.0, 0),
    'window': (1.0, 0.77, 0.42, 2),
    'chitin': (0.17, 0.10, 0.24, 0),
    'chitinLight': (0.32, 0.21, 0.43, 0),
    'shell': (0.17, 0.10, 0.24, 0),
    'fleshDark': (0.23, 0.11, 0.2, 0),
    'membrane': (0.36, 1.0, 0.69, 0),
    'bone': (0.85, 0.8, 0.7, 0),
    'glowGreen': (0.36, 1.0, 0.62, 3),
    'glowPink': (1.0, 0.25, 0.71, 3),
    'glowViolet': (0.75, 0.42, 1.0, 3),
    'rock': (0.4, 0.37, 0.34, 0),
    'crystal': (0.56, 0.89, 1.0, 1),
    'glow': (0.36, 1.0, 0.62, 3),
    'glowBlue': (0.31, 0.76, 1.0, 3),
    'glowYellow': (1.0, 0.83, 0.42, 3),
    'glowCyan': (0.28, 0.91, 1.0, 3),
    'glass': (0.75, 0.9, 1.0, 0),
    'solar': (0.16, 0.35, 0.66, 0),
    'metal': (0.79, 0.81, 0.84, 0),
    'red': (0.85, 0.25, 0.18, 0),
}


def g(x, y, z):
    """Game (three.js) coordinates to Blender coordinates."""
    return Vector((x, -z, y))


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def material(name):
    mat = bpy.data.materials.get(name)
    if mat:
        return mat
    mat = bpy.data.materials.new(name)
    r, gr, b, glow = PREVIEW.get(name, (0.8, 0.8, 0.8, 0))
    bsdf = next(n for n in mat.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    bsdf.inputs['Base Color'].default_value = (r, gr, b, 1)
    if glow:
        bsdf.inputs['Emission Color'].default_value = (r, gr, b, 1)
        bsdf.inputs['Emission Strength'].default_value = glow
    return mat


def obj_from_bmesh(name, bm, mat, smooth=True, parent=None):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    me.materials.append(material(mat))
    if smooth:
        me.shade_smooth()
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    if parent:
        ob.parent = parent
    return ob


def empty(name, pos=(0, 0, 0), rot_y=0.0, parent=None):
    """A pivot node (shows up as a named Object3D in the game, for animation)."""
    ob = bpy.data.objects.new(name, None)
    ob.location = g(*pos)
    ob.rotation_euler = (0, 0, rot_y)
    bpy.context.scene.collection.objects.link(ob)
    if parent:
        ob.parent = parent
    return ob


def sphere(name, r, pos, scale=(1, 1, 1), mat='white', segs=16, rings=10, parent=None):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=segs, v_segments=rings, radius=r)
    sx, sy, sz = scale
    m = Matrix.Translation(g(*pos)) @ Matrix.Diagonal((sx, sz, sy, 1))
    bmesh.ops.transform(bm, matrix=m, verts=bm.verts)
    return obj_from_bmesh(name, bm, mat, parent=parent)


def tube(name, a, b, r1, r2, mat, segs=8, parent=None, caps=True):
    """A tapered tube from game point a to game point b."""
    pa, pb = g(*a), g(*b)
    d = pb - pa
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=caps, segments=segs, radius1=r1, radius2=r2, depth=d.length)
    rot = Vector((0, 0, 1)).rotation_difference(d.normalized()).to_matrix().to_4x4()
    bmesh.ops.transform(bm, matrix=Matrix.Translation((pa + pb) / 2) @ rot, verts=bm.verts)
    return obj_from_bmesh(name, bm, mat, parent=parent)


def sweep(name, points, radii, mat, segs=6, parent=None):
    """One smooth tube through game points (veins, legs, horns, tentacles). Pointed if a radius is 0."""
    pts = [g(*p) for p in points]
    bm = bmesh.new()
    rings = []
    for i, p in enumerate(pts):
        a = pts[max(i - 1, 0)]
        b = pts[min(i + 1, len(pts) - 1)]
        tangent = (b - a).normalized()
        side = tangent.orthogonal().normalized()
        up = tangent.cross(side)
        ring = []
        for k in range(segs):
            t = k / segs * math.tau
            ring.append(bm.verts.new(p + (side * math.cos(t) + up * math.sin(t)) * radii[i]))
        rings.append(ring)
    for r0, r1 in zip(rings, rings[1:]):
        for k in range(segs):
            bm.faces.new((r0[k], r0[(k + 1) % segs], r1[(k + 1) % segs], r1[k]))
    bm.faces.new(list(reversed(rings[0])))
    bm.faces.new(rings[-1])
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return obj_from_bmesh(name, bm, mat, parent=parent)


def chain(name, points, radii, mat, segs=8, parent=None):
    """Tapered tubes through game points with round joints (legs, horns, tentacles)."""
    parts = []
    for i in range(len(points) - 1):
        parts.append(tube(f'{name}_{i}', points[i], points[i + 1], radii[i], radii[i + 1], mat, segs))
    for i in range(1, len(points) - 1):
        parts.append(sphere(f'{name}_j{i}', radii[i] * 1.15, points[i], mat=mat, segs=segs, rings=6))
    return join(parts, name, parent=parent)


def join(objs, name, parent=None):
    """Joins objects into the first one. Keeps materials. Applies modifiers first
    (else the first object's modifiers would act on the whole result)."""
    for ob in objs:
        if ob.modifiers:
            apply_all(ob)
    if len(objs) == 1:
        objs[0].name = name
        if parent:
            objs[0].parent = parent
        return objs[0]
    with bpy.context.temp_override(
        active_object=objs[0], selected_editable_objects=objs, selected_objects=objs
    ):
        bpy.ops.object.join()
    ob = objs[0]
    ob.name = name
    if parent:
        ob.parent = parent
    return ob


def displace(ob, strength, size, kind='CLOUDS', depth=2):
    """Bumpy surface from a procedural texture (applied on export)."""
    tex = bpy.data.textures.new(f'{ob.name}_tex', kind)
    if hasattr(tex, 'noise_scale'):
        tex.noise_scale = size
    if hasattr(tex, 'noise_depth'):
        tex.noise_depth = depth
    mod = ob.modifiers.new('displace', 'DISPLACE')
    mod.texture = tex
    mod.strength = strength
    mod.mid_level = 0.5
    return mod


def bevel(ob, width, segments=2, angle=30):
    mod = ob.modifiers.new('bevel', 'BEVEL')
    mod.width = width
    mod.segments = segments
    mod.limit_method = 'ANGLE'
    mod.angle_limit = math.radians(angle)
    mod.use_clamp_overlap = True
    mod.harden_normals = True
    return mod


def apply_all(ob):
    """Applies all modifiers (needed before joining or reading the final mesh)."""
    dg = bpy.context.evaluated_depsgraph_get()
    me = bpy.data.meshes.new_from_object(ob.evaluated_get(dg))
    ob.modifiers.clear()
    old = ob.data
    ob.data = me
    bpy.data.meshes.remove(old)


def triangles():
    dg = bpy.context.evaluated_depsgraph_get()
    total = 0
    for ob in bpy.context.scene.objects:
        if ob.type != 'MESH':
            continue
        me = ob.evaluated_get(dg).to_mesh()
        me.calc_loop_triangles()
        total += len(me.loop_triangles)
        ob.evaluated_get(dg).to_mesh_clear()
    return total


def export(path):
    animated = any(o.animation_data and o.animation_data.nla_tracks for o in bpy.context.scene.objects)
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format='GLB',
        export_apply=True,
        export_yup=True,
        export_materials='EXPORT',
        export_texcoords=False,
        export_animations=animated,
        export_animation_mode='NLA_TRACKS',
        export_merge_animation='NLA_TRACK',
        export_force_sampling=False,
        export_extras=False,
    )


def box(name, size, pos, mat, bevel_width=0.0, parent=None):
    """A box in game coordinates: size = (x width, y height, z depth)."""
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1)
    sx, sy, sz = size
    bmesh.ops.transform(bm, matrix=Matrix.Translation(g(*pos)) @ Matrix.Diagonal((sx, sz, sy, 1)), verts=bm.verts)
    ob = obj_from_bmesh(name, bm, mat, smooth=False, parent=parent)
    if bevel_width:
        bevel(ob, bevel_width, segments=2)
    return ob


def slab(name, points, thickness, y, mat, parent=None):
    """A flat plate (wing, fin) from game (x, z) points, `thickness` high, centered at height y."""
    bm = bmesh.new()
    low = [bm.verts.new(g(x, y - thickness / 2, z)) for x, z in points]
    high = [bm.verts.new(g(x, y + thickness / 2, z)) for x, z in points]
    n = len(points)
    bm.faces.new(low)
    bm.faces.new(list(reversed(high)))
    for i in range(n):
        j = (i + 1) % n
        bm.faces.new((low[i], high[i], high[j], low[j]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return obj_from_bmesh(name, bm, mat, smooth=False, parent=parent)


def fin(name, points, thickness, x, mat, parent=None):
    """An upright plate (tail fin) from game (z, y) points at side position x."""
    bm = bmesh.new()
    a = [bm.verts.new(g(x - thickness / 2, y, z)) for z, y in points]
    b = [bm.verts.new(g(x + thickness / 2, y, z)) for z, y in points]
    n = len(points)
    bm.faces.new(a)
    bm.faces.new(list(reversed(b)))
    for i in range(n):
        j = (i + 1) % n
        bm.faces.new((a[i], b[i], b[j], a[j]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return obj_from_bmesh(name, bm, mat, smooth=False, parent=parent)


def loft(name, sections, mat, segs=16, power=2.6, smooth=True, parent=None):
    """A hull through cross sections along z (game coordinates).

    sections: list of (z, half_width, half_height, y_center). The cross section is a
    superellipse (power 2 = ellipse, higher = boxier). Ends are closed.
    """
    bm = bmesh.new()
    rings = []
    for z, w, h, yc in sections:
        ring = []
        for k in range(segs):
            t = k / segs * math.tau
            c, s = math.cos(t), math.sin(t)
            x = math.copysign(abs(c) ** (2 / power), c) * w
            y = math.copysign(abs(s) ** (2 / power), s) * h
            ring.append(bm.verts.new(g(x, yc + y, z)))
        rings.append(ring)
    for r0, r1 in zip(rings, rings[1:]):
        for k in range(segs):
            bm.faces.new((r0[k], r0[(k + 1) % segs], r1[(k + 1) % segs], r1[k]))
    bm.faces.new(list(reversed(rings[0])))
    bm.faces.new(rings[-1])
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    ob = obj_from_bmesh(name, bm, mat, smooth=smooth, parent=parent)
    if smooth:
        ob.data.set_sharp_from_angle(angle=math.radians(50))
    return ob


def engine(name, pos, radius, length, glow='glowBlue', segs=12):
    """An engine nozzle pointing back (-z) with a glowing core."""
    x, y, z = pos
    shell = tube(f'{name}Shell', (x, y, z), (x, y, z - length), radius, radius * 1.15, 'steel', segs=segs)
    ring = tube(f'{name}Ring', (x, y, z - length * 0.7), (x, y, z - length * 0.85), radius * 1.22, radius * 1.22, 'orange', segs=segs)
    core = sphere(f'{name}Core', radius * 0.85, (x, y, z - length), (1, 1, 0.4), glow, segs=segs, rings=6)
    return [shell, ring], core
