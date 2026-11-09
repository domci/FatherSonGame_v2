export interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface BoxHandlers {
  /** Should this pointer press draw a box (Shift key, or the touch "Rahmen" mode)? */
  wants(e: PointerEvent): boolean;
  /** Called with the box in screen pixels when the pointer is released. */
  done(rect: Rect): void;
  /** A press without dragging (e.g. Shift + click to add a unit). */
  tap(e: PointerEvent): void;
}

const MIN_SIZE = 8;

function rectOf(x0: number, y0: number, x1: number, y1: number): Rect {
  return {
    left: Math.min(x0, x1),
    top: Math.min(y0, y1),
    right: Math.max(x0, x1),
    bottom: Math.max(y0, y1),
  };
}

/**
 * Drag a selection box. The listener runs in the capture phase and stops the event,
 * so the camera does not move while the box is drawn.
 */
export function listenBox(canvas: HTMLCanvasElement, layer: HTMLElement, h: BoxHandlers): void {
  const box = document.createElement('div');
  box.className = 'select-box';
  box.hidden = true;
  layer.append(box);
  let start: { x: number; y: number; id: number } | null = null;
  const show = (r: Rect): void => {
    Object.assign(box.style, {
      left: `${r.left}px`,
      top: `${r.top}px`,
      width: `${r.right - r.left}px`,
      height: `${r.bottom - r.top}px`,
    });
  };
  canvas.addEventListener(
    'pointerdown',
    (e) => {
      if (!e.isPrimary || e.button !== 0 || !h.wants(e)) return;
      e.stopImmediatePropagation();
      canvas.setPointerCapture(e.pointerId);
      start = { x: e.clientX, y: e.clientY, id: e.pointerId };
      show(rectOf(e.clientX, e.clientY, e.clientX, e.clientY));
      box.hidden = false;
    },
    { capture: true },
  );
  canvas.addEventListener('pointermove', (e) => {
    if (start?.id === e.pointerId) show(rectOf(start.x, start.y, e.clientX, e.clientY));
  });
  const finish = (e: PointerEvent): void => {
    if (start?.id !== e.pointerId) return;
    const r = rectOf(start.x, start.y, e.clientX, e.clientY);
    start = null;
    box.hidden = true;
    if (r.right - r.left >= MIN_SIZE || r.bottom - r.top >= MIN_SIZE) h.done(r);
    else h.tap(e);
  };
  canvas.addEventListener('pointerup', finish);
  canvas.addEventListener('pointercancel', finish);
}
