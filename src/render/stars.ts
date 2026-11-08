import { BufferGeometry, Float32BufferAttribute, Points, PointsNodeMaterial } from 'three/webgpu';

/** A sphere of stars around the scene. Uses a fixed pattern, so it looks the same every time. */
export function createStars(radius: number, count = 3000): Points {
  const positions: number[] = [];
  const colors: number[] = [];
  let seed = 12345;
  const rand = (): number => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < count; i++) {
    const u = rand() * 2 - 1;
    const a = rand() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    positions.push(Math.cos(a) * s * radius, u * radius, Math.sin(a) * s * radius);
    const b = 0.5 + rand() * 0.5;
    const warm = rand() < 0.2;
    colors.push(b, b * (warm ? 0.85 : 0.95), b * (warm ? 0.7 : 1));
  }
  const geo = new BufferGeometry();
  geo.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geo.setAttribute('color', new Float32BufferAttribute(colors, 3));
  const mat = new PointsNodeMaterial({ size: 2, sizeAttenuation: false, vertexColors: true });
  return new Points(geo, mat);
}
