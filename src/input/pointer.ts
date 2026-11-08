import { Vector2 } from 'three/webgpu';

export interface PointerHandlers {
  /** A short tap or click (not a drag). */
  onTap(ndc: Vector2, e: PointerEvent): void;
  onHover(ndc: Vector2): void;
}

const MAX_MOVE = 8;
const MAX_TIME = 450;

/** Turns pointer events into taps (for selecting) without breaking camera drags. */
export function listenPointer(canvas: HTMLCanvasElement, handlers: PointerHandlers): void {
  let down: { x: number; y: number; t: number; id: number } | null = null;
  const ndc = (e: PointerEvent): Vector2 => {
    const r = canvas.getBoundingClientRect();
    return new Vector2(
      ((e.clientX - r.left) / r.width) * 2 - 1,
      -((e.clientY - r.top) / r.height) * 2 + 1,
    );
  };
  canvas.addEventListener('pointerdown', (e) => {
    down = e.isPrimary
      ? { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId }
      : null;
  });
  canvas.addEventListener('pointerup', (e) => {
    if (!down || down.id !== e.pointerId) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
    const quick = performance.now() - down.t < MAX_TIME;
    down = null;
    if (moved < MAX_MOVE && quick && e.button === 0) handlers.onTap(ndc(e), e);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'mouse') handlers.onHover(ndc(e));
  });
}
