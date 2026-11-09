import {
  Color,
  DoubleSide,
  MeshPhysicalNodeMaterial,
  MeshStandardNodeMaterial,
  type Material,
} from 'three/webgpu';
import {
  mx_noise_float,
  normalLocal,
  positionLocal,
  positionWorld,
  sin,
  time,
  vec3,
} from 'three/tsl';

/**
 * Alien look: living, glossy chitin, soft flesh that breathes a little, glowing veins.
 * Materials are shared (cached), like solidMaterial.
 */
const cache = new Map<string, Material>();

function cached(key: string, make: () => Material): Material {
  let m = cache.get(key);
  if (!m) {
    m = make();
    cache.set(key, m);
  }
  return m;
}

/** Lumpy, slowly breathing surface. */
function breathe(m: MeshStandardNodeMaterial, amount: number): void {
  const lump = mx_noise_float(positionLocal.mul(3.5)).mul(amount);
  const pulse = sin(time.mul(1.6).add(positionWorld.x.mul(0.7))).mul(amount * 0.35);
  m.positionNode = positionLocal.add(normalLocal.mul(lump.add(pulse)));
}

/** `alive` = the surface breathes. Off for animated (skinned) units: it would break skinning. */
export function chitin(hex = 0x2b1a3d, alive = true): Material {
  return cached(`chitin-${hex}-${alive}`, () => {
    const m = new MeshPhysicalNodeMaterial({
      color: hex,
      metalness: 0.15,
      roughness: 0.32,
      clearcoat: 1,
      clearcoatRoughness: 0.18,
      sheen: 0.6,
      sheenColor: new Color(0x9a6bff),
    });
    if (alive) breathe(m, 0.02);
    return m;
  });
}

export function flesh(hex = 0x6e3157, alive = true): Material {
  return cached(`flesh-${hex}-${alive}`, () => {
    const m = new MeshStandardNodeMaterial({ color: hex, metalness: 0, roughness: 0.62 });
    const spots = mx_noise_float(positionWorld.mul(4)).mul(0.25).add(0.9);
    m.colorNode = vec3(new Color(hex).r, new Color(hex).g, new Color(hex).b).mul(spots);
    if (alive) breathe(m, 0.035);
    return m;
  });
}

/** Glowing veins and eyes that pulse slowly. */
export function alienGlow(hex: number, strength = 2.6): Material {
  return cached(`glow-${hex}-${strength}`, () => {
    const c = new Color(hex);
    const m = new MeshStandardNodeMaterial({ color: hex, metalness: 0, roughness: 0.4 });
    const pulse = sin(time.mul(2.2).add(positionWorld.x.add(positionWorld.z).mul(1.3)))
      .mul(0.3)
      .add(0.85);
    m.emissiveNode = vec3(c.r, c.g, c.b).mul(pulse.mul(strength));
    return m;
  });
}

/** See-through skin with a glowing tint (alien windows, bubbles). */
export function membrane(hex = 0x5dffb0): Material {
  return cached(`membrane-${hex}`, () => {
    const m = new MeshPhysicalNodeMaterial({
      color: hex,
      metalness: 0,
      roughness: 0.15,
      transmission: 0.6,
      thickness: 0.4,
      transparent: true,
      opacity: 0.5,
      side: DoubleSide,
      emissive: new Color(hex),
      emissiveIntensity: 0.35,
    });
    return m;
  });
}

export function bone(): Material {
  return cached(
    'bone',
    () => new MeshStandardNodeMaterial({ color: 0xd9ccb0, metalness: 0, roughness: 0.55 }),
  );
}

/** Kenney kit parts painted in alien colors (ships). */
export const ALIEN_KIT: Record<string, () => Material> = {
  metal: () => chitin(0x3a2452),
  metalDark: () => chitin(0x1d1328),
  metalRed: () => alienGlow(0x5dff9e, 2),
  dark: () => chitin(0x120c19),
  _defaultMat: () => chitin(0x3a2452),
};
