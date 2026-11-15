"""Simple animations for game models: pivots (empties) move, meshes ride along.

Each clip becomes one glTF animation named 'Rig|<Clip>' (the game's Animator finds
'|Idle', '|Run' or '|Walk', '|Shoot' or '|Attack'; see src/render/models/animator.ts).
Channels use game axes: 'turn' (around up), 'pitch' (around x), 'roll' (around z), 'x', 'y', 'z'.
"""

import bpy

FPS = 24
CHANNELS = {
    'turn': ('rotation_euler', 2, 1),
    'pitch': ('rotation_euler', 0, 1),
    'roll': ('rotation_euler', 1, -1),
    'x': ('location', 0, 1),
    'y': ('location', 2, 1),
    'z': ('location', 1, -1),
}


def clip(name, tracks):
    """tracks: {object_name: {channel: [(seconds, offset_from_rest), ...]}}"""
    return name, tracks


def _key_object(ob, clip_name, channels):
    rest_loc = ob.location.copy()
    rest_rot = ob.rotation_euler.copy()
    ob.animation_data_create()
    action = bpy.data.actions.new(f'{ob.name}_{clip_name}')
    ob.animation_data.action = action
    for channel, keys in channels.items():
        path, index, sign = CHANNELS[channel]
        rest = (rest_loc if path == 'location' else rest_rot)[index]
        for t, offset in keys:
            getattr(ob, path)[index] = rest + sign * offset
            ob.keyframe_insert(data_path=path, index=index, frame=1 + t * FPS)
    ob.location = rest_loc
    ob.rotation_euler = rest_rot
    track = ob.animation_data.nla_tracks.new()
    track.name = f'Rig|{clip_name}'
    track.strips.new(track.name, 1, action)
    ob.animation_data.action = None


def add_clips(clips):
    """clips: list of (name, tracks). Every clip should loop: same value at start and end."""
    for clip_name, tracks in clips:
        for obj_name, channels in tracks.items():
            _key_object(bpy.data.objects[obj_name], clip_name, channels)


def loop(values, length=1.0):
    """Evenly spaced keys over `length` seconds that end where they start."""
    n = len(values)
    return [(i * length / n, v) for i, v in enumerate(values)] + [(length, values[0])]
