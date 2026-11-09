import { CatmullRomCurve3, TubeGeometry, Vector3, type BufferGeometry } from 'three/webgpu';

/** A curved horn or root: thickness, height and how much it bends. */
export function tendril(t: number, h: number, bend: number): BufferGeometry {
  const curve = new CatmullRomCurve3([
    new Vector3(0, 0, 0),
    new Vector3(bend * 0.3, h * 0.4, 0),
    new Vector3(bend * 0.8, h * 0.8, 0),
    new Vector3(bend, h, 0),
  ]);
  const geo = new TubeGeometry(curve, 16, t, 8, false);
  // Thin out towards the tip.
  const pos = geo.attributes.position;
  if (pos) {
    for (let i = 0; i < pos.count; i++) {
      const v = Math.min(1, Math.max(0, pos.getY(i) / Math.max(0.001, h)));
      const k = 1 - v * 0.8;
      const cx = bend * (v * v * 0.6 + v * 0.4);
      pos.setX(i, cx + (pos.getX(i) - cx) * k);
      pos.setZ(i, pos.getZ(i) * k);
    }
    geo.computeVertexNormals();
  }
  return geo;
}
