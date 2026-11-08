import {
  DoubleSide,
  MeshPhysicalNodeMaterial,
  MeshStandardNodeMaterial,
  Color,
} from 'three/webgpu';
import {
  color,
  mix,
  mx_fractal_noise_float,
  mx_noise_float,
  positionWorld,
  smoothstep,
  vec3,
} from 'three/tsl';

/** Dusty regolith ground made with noise (no texture files needed). */
export function groundMaterial(): MeshStandardNodeMaterial {
  const m = new MeshStandardNodeMaterial({ roughness: 0.95, metalness: 0 });
  const p = positionWorld.xz;
  const big = mx_fractal_noise_float(vec3(p.mul(0.06), 0), 4, 2, 0.5);
  const fine = mx_noise_float(vec3(p.mul(1.7), 1));
  const base = mix(color(0x4a433d), color(0x8a7d6e), smoothstep(-0.5, 0.6, big));
  m.colorNode = base.mul(fine.mul(0.2).add(0.9));
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
