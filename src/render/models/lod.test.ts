import { describe, expect, it } from 'vitest';
import { Group, LOD, Mesh } from 'three/webgpu';
import { makeLods } from './lod';

function named(name: string, x = 0): Mesh {
  const m = new Mesh();
  m.name = name;
  m.position.x = x;
  return m;
}

describe('makeLods', () => {
  it('puts a mesh and its two simpler copies into one LOD object', () => {
    const root = new Group();
    const leg = new Group();
    leg.name = 'leg0';
    leg.add(named('foot', 2), named('foot__lod1', 2), named('foot__lod2', 2));
    root.add(leg, named('body'));
    expect(makeLods(root)).toBe(1);
    const lod = leg.children[0] as LOD;
    expect(lod).toBeInstanceOf(LOD);
    expect(lod.name).toBe('foot');
    expect(lod.position.x).toBe(2);
    expect(lod.levels.map((l) => l.distance)).toEqual([0, 26, 44]);
    expect(root.getObjectByName('leg0')).toBe(leg);
  });

  it('leaves meshes without levels alone', () => {
    const root = new Group();
    root.add(named('a'), named('a__lod1'));
    expect(makeLods(root)).toBe(0);
    expect(root.children).toHaveLength(2);
  });
});
