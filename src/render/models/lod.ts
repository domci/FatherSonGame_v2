import { LOD, type Object3D } from 'three/webgpu';

/** Distance (tiles) from the camera where each detail level starts. Matches tools/models/optimize.ts. */
export const LOD_DISTANCES = [0, 26, 44] as const;
const SUFFIXES = ['__lod1', '__lod2'] as const;

/**
 * Blender models carry detail levels as siblings: `X`, `X__lod1`, `X__lod2`
 * (made by tools/models/optimize.ts). This puts each group into one three.js LOD object,
 * which shows only one level, by camera distance. Returns how many LOD objects were made.
 */
export function makeLods(root: Object3D): number {
  const groups: { main: Object3D; rest: Object3D[] }[] = [];
  root.traverse((o) => {
    const parent = o.parent;
    if (!parent || o.name.includes('__lod')) return;
    const rest = SUFFIXES.flatMap((s) => parent.children.filter((c) => c.name === o.name + s));
    if (rest.length === SUFFIXES.length) groups.push({ main: o, rest });
  });
  for (const { main, rest } of groups) {
    const parent = main.parent;
    if (!parent) continue;
    const lod = new LOD();
    lod.name = main.name;
    lod.position.copy(main.position);
    lod.quaternion.copy(main.quaternion);
    lod.scale.copy(main.scale);
    parent.add(lod);
    [main, ...rest].forEach((level, i) => {
      parent.remove(level);
      level.position.set(0, 0, 0);
      level.quaternion.identity();
      level.scale.set(1, 1, 1);
      lod.addLevel(level, LOD_DISTANCES[i] ?? 0);
    });
  }
  return groups.length;
}
