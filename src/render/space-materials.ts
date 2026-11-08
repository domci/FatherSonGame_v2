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
  normalView,
  positionLocal,
  pow,
  sin,
  smoothstep,
  time,
  vec3,
} from 'three/tsl';
import type { Body } from '../sim/generation/solar-system';

function shade(hex: number, factor: number): number {
  return new Color(hex).multiplyScalar(factor).getHex();
}

/** Planet surface made from noise. Gas planets get bands. */
export function planetMaterial(
  body: Pick<Body, 'kind' | 'color'>,
  scale = 1,
): MeshStandardNodeMaterial {
  const m = new MeshStandardNodeMaterial({
    roughness: body.kind === 'gas' ? 0.6 : 0.9,
    metalness: 0,
  });
  const p = positionLocal.div(scale);
  const dark = color(shade(body.color, 0.55));
  const light = color(shade(body.color, 1.25));
  if (body.kind === 'gas') {
    const warp = mx_noise_float(p.mul(2.2)).mul(1.8);
    const bands = sin(p.y.mul(9).add(warp)).mul(0.5).add(0.5);
    m.colorNode = mix(dark, light, bands);
  } else {
    const n = mx_fractal_noise_float(p.mul(2.4), 5, 2, 0.5);
    const spots = smoothstep(0.25, 0.6, mx_noise_float(p.mul(6)));
    m.colorNode = mix(dark, light, smoothstep(-0.5, 0.6, n)).mul(float(1).sub(spots.mul(0.25)));
  }
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
