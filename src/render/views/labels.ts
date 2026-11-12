import { CanvasTexture, SRGBColorSpace, Sprite, SpriteMaterial } from 'three/webgpu';

/** A text label that always faces the camera and keeps the same size on screen. */
export function textLabel(text: string, color = '#e8eef8'): Sprite {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 512;
  canvas.height = 96;
  if (ctx) {
    ctx.font = '600 44px system-ui, sans-serif';
    // Long names ("Ganvos (Kolonie Nova)") get a smaller font so they fit.
    const wide = ctx.measureText(text).width;
    if (wide > 496) ctx.font = `600 ${Math.floor((44 * 496) / wide)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = color;
    ctx.fillText(text, 256, 48);
  }
  const map = new CanvasTexture(canvas);
  map.colorSpace = SRGBColorSpace;
  const sprite = new Sprite(
    new SpriteMaterial({ map, transparent: true, depthWrite: false, sizeAttenuation: false }),
  );
  sprite.scale.set(0.22, 0.041, 1);
  sprite.center.set(0.5, 0);
  sprite.raycast = () => undefined;
  sprite.renderOrder = 10;
  return sprite;
}
