/**
 * Makes the raw Blender models small and fast for the game:
 * merge equal data, weld vertices, add detail levels (LOD), compress (meshopt).
 *
 * Usage: bun tools/models/optimize.ts            (all files in tools/models/out/)
 * Input:  tools/models/out/<name>.glb            (from tools/models/blender/build_all.py)
 * Output: public/models/blender/<name>.glb
 *
 * LOD: every mesh node `X` gets siblings `X__lod1` and `X__lod2` with fewer triangles.
 * The game turns them into a three.js LOD object (src/render/models/lod.ts).
 */
import { mkdirSync, readdirSync, statSync } from 'node:fs';
import { basename, join } from 'node:path';
import { NodeIO, type Document, type Node } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, meshopt, prune, simplifyPrimitive, weld } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';

const IN = 'tools/models/out';
const OUT = 'public/models/blender';
/** Share of vertices kept per detail level, and the allowed error (share of mesh size). */
export const LEVELS = [
  { suffix: '__lod1', ratio: 0.35, error: 0.01 },
  { suffix: '__lod2', ratio: 0.12, error: 0.04 },
] as const;

function addLevels(doc: Document, node: Node): void {
  const mesh = node.getMesh();
  if (!mesh || node.getName().includes('__lod')) return;
  for (const level of LEVELS) {
    const copy = mesh.clone().setName(mesh.getName() + level.suffix);
    for (const prim of copy.listPrimitives()) {
      const simple = prim.clone();
      simplifyPrimitive(simple, { simplifier: MeshoptSimplifier, ...level });
      // Tiny thin parts (wings) can vanish: keep them as they are then (an empty buffer breaks meshopt).
      if (!simple.getIndices()?.getCount()) continue;
      copy.removePrimitive(prim);
      copy.addPrimitive(simple);
    }
    const lod = doc
      .createNode(node.getName() + level.suffix)
      .setTranslation(node.getTranslation())
      .setRotation(node.getRotation())
      .setScale(node.getScale())
      .setMesh(copy);
    const parent = node.getParentNode();
    if (parent) parent.addChild(lod);
    else for (const scene of doc.getRoot().listScenes()) if (scene.listChildren().includes(node)) scene.addChild(lod);
  }
}

function triangles(doc: Document, suffix: string): number {
  let n = 0;
  for (const node of doc.getRoot().listNodes()) {
    const name = node.getName();
    if (!node.getMesh() || (suffix ? !name.endsWith(suffix) : name.includes('__lod'))) continue;
    for (const p of node.getMesh()?.listPrimitives() ?? []) n += (p.getIndices()?.getCount() ?? 0) / 3;
  }
  return n;
}

async function optimize(io: NodeIO, file: string): Promise<void> {
  const doc = await io.read(join(IN, file));
  await doc.transform(dedup(), weld());
  for (const node of doc.getRoot().listNodes()) addLevels(doc, node);
  await doc.transform(prune(), meshopt({ encoder: MeshoptEncoder, level: 'high' }));
  const out = join(OUT, file);
  await io.write(out, doc);
  const tris = ['', ...LEVELS.map((l) => l.suffix)].map((s) => triangles(doc, s));
  const kb = (statSync(out).size / 1024).toFixed(1);
  console.info(`${basename(file, '.glb')}: triangles ${tris.join(' / ')}, ${kb} KB`);
}

await Promise.all([MeshoptEncoder.ready, MeshoptSimplifier.ready]);
mkdirSync(OUT, { recursive: true });
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.encoder': MeshoptEncoder,
});
const only = process.argv.slice(2);
for (const file of readdirSync(IN).filter((f) => f.endsWith('.glb')))
  if (!only.length || only.includes(basename(file, '.glb'))) await optimize(io, file);
