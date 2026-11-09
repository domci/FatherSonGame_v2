import {
  AdditiveBlending,
  Color,
  MeshBasicNodeMaterial,
  MeshStandardNodeMaterial,
} from 'three/webgpu';
import {
  color,
  float,
  mix,
  mx_fractal_noise_float,
  mx_noise_float,
  mx_worley_noise_float,
  normalView,
  positionLocal,
  pow,
  sin,
  smoothstep,
  time,
  vec3,
} from 'three/tsl';
import type { Node } from 'three/webgpu';
import type { Body } from '../sim/generation/solar-system';

function shade(hex: number, factor: number): number {
  return new Color(hex).multiplyScalar(factor).getHex();
}

/** Craters in a few of the noise cells: a dark bowl and a light rim. */
function crater(
  cells: Node<'vec3'>,
  maskAt: Node<'vec3'>,
): { bowl: Node<'float'>; rim: Node<'float'> } {
  const w = mx_worley_noise_float(cells);
  const mask = smoothstep(0.3, 0.6, mx_noise_float(maskAt));
  const bowl = float(1)
    .sub(smoothstep(0.04, 0.2, w))
    .mul(mask);
  const rim = smoothstep(0.15, 0.22, w)
    .sub(smoothstep(0.22, 0.35, w))
    .mul(mask);
  return { bowl, rim };
}

/** Colors of the ground on the surface view (planets with a base use them too). */
export const REGOLITH = { dark: 0x3b3632, light: 0x9c9184 } as const;

/**
 * Planet surface made from noise. Gas planets get bands.
 * `detail` (0..1) adds small craters and rocks for close-up views. It costs much more,
 * so far away the cheap material (without `detail`) is used.
 */
export function planetMaterial(
  body: Pick<Body, 'kind' | 'color'>,
  scale = 1,
  detail?: Node<'float'>,
  ground?: { dark: number; light: number },
): MeshStandardNodeMaterial {
  const m = new MeshStandardNodeMaterial({
    roughness: body.kind === 'gas' ? 0.6 : 0.9,
    metalness: 0,
  });
  const p = positionLocal.div(scale);
  const dark = color(ground?.dark ?? shade(body.color, 0.55));
  const light = color(ground?.light ?? shade(body.color, 1.25));
  if (body.kind === 'gas') {
    const warp = mx_noise_float(p.mul(2.2)).mul(1.8);
    const bands = sin(p.y.mul(9).add(warp)).mul(0.5).add(0.5);
    m.colorNode = mix(dark, light, bands);
    return m;
  }
  let n = mx_fractal_noise_float(p.mul(2.4), 5, 2, 0.5);
  let spots = smoothstep(0.25, 0.6, mx_noise_float(p.mul(6)));
  if (detail) {
    n = n.add(mx_fractal_noise_float(p.mul(48), 6, 2, 0.5).mul(detail.mul(0.3)));
    for (const [size, seed] of [
      [40, 13],
      [150, 47],
    ] as const) {
      const c = crater(p.mul(size), p.mul(seed));
      n = n.add(c.rim.mul(detail.mul(0.35)));
      spots = spots.add(c.bowl.mul(detail.mul(0.8)));
    }
  }
  m.colorNode = mix(dark, light, smoothstep(-0.35, 0.8, n)).mul(float(1).sub(spots.mul(0.25)));
  return m;
}

/** Soft glowing edge around a planet. */
export function atmosphereMaterial(hex: number, strength = 1): MeshBasicNodeMaterial {
  const m = new MeshBasicNodeMaterial({
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
  });
  m.colorNode = color(hex);
  m.opacityNode = pow(float(1).sub(normalView.z), 3).mul(strength);
  return m;
}

/** Bright, moving sun surface. Values above 1 make the bloom glow. */
export function sunMaterial(): MeshBasicNodeMaterial {
  const m = new MeshBasicNodeMaterial();
  const n = mx_fractal_noise_float(
    positionLocal.mul(0.8).add(vec3(time.mul(0.15), 0, 0)),
    4,
    2,
    0.5,
  );
  m.colorNode = mix(color(0xff7a1a), color(0xfff1a8), smoothstep(-0.4, 0.6, n)).mul(4);
  return m;
}
