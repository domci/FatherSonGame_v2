import {
  DoubleSide,
  MeshPhysicalNodeMaterial,
  MeshStandardNodeMaterial,
  Color,
} from 'three/webgpu';
import { mx_noise_float, positionWorld, vec3, vertexColor } from 'three/tsl';

/** Dusty regolith ground: vertex colors (craters, patches) plus fine grain noise. */
export function groundMaterial(): MeshStandardNodeMaterial {
  const m = new MeshStandardNodeMaterial({ roughness: 0.97, metalness: 0 });
  const p = positionWorld.xz;
  const grain = mx_noise_float(vec3(p.mul(6), 1)).mul(0.08);
  const pebbles = mx_noise_float(vec3(p.mul(1.6), 2)).mul(0.1);
  m.colorNode = vertexColor().mul(grain.add(pebbles).add(0.95));
  return m;
}

export function glassMaterial(tint = 0xbfe6ff): MeshPhysicalNodeMaterial {
  return new MeshPhysicalNodeMaterial({
    color: tint,
    metalness: 0,
    roughness: 0.05,
    transmission: 0.85,
    thickness: 0.3,
    transparent: true,
    opacity: 0.55,
    side: DoubleSide,
  });
}

const cache = new Map<string, MeshStandardNodeMaterial>();

/** Shared simple materials, cached by name. */
export function solidMaterial(
  hex: number,
  opts: { metal?: number; rough?: number; glow?: number } = {},
): MeshStandardNodeMaterial {
  const key = `${hex}-${opts.metal ?? 0.6}-${opts.rough ?? 0.4}-${opts.glow ?? 0}`;
  let m = cache.get(key);
  if (!m) {
    m = new MeshStandardNodeMaterial({
      color: hex,
      metalness: opts.metal ?? 0.6,
      roughness: opts.rough ?? 0.4,
    });
    if (opts.glow) {
      m.emissive = new Color(hex);
      m.emissiveIntensity = opts.glow;
    }
    cache.set(key, m);
  }
  return m;
}
