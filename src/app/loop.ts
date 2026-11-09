export interface LoopHooks {
  tickMs: number;
  speed(): number;
  tick(): void;
  frame(dtMs: number): void;
  /** Called about 5 times per second (menus). */
  slow(): void;
}

const MAX_TICKS_PER_FRAME = 400;

/**
 * Fixed-step game loop: the game logic runs in steps of tickMs, drawing runs every frame.
 * Returns a function that stops the loop.
 */
export function startLoop(hooks: LoopHooks): () => void {
  let running = true;
  let last = performance.now();
  let acc = 0;
  let slowAcc = 0;
  const frame = (now: number): void => {
    if (!running) return;
    const dt = Math.min(250, now - last);
    last = now;
    acc += dt * hooks.speed();
    let n = 0;
    while (acc >= hooks.tickMs && n < MAX_TICKS_PER_FRAME) {
      hooks.tick();
      acc -= hooks.tickMs;
      n++;
    }
    if (n === MAX_TICKS_PER_FRAME) acc = 0;
    hooks.frame(dt);
    slowAcc += dt;
    if (slowAcc > 200) {
      slowAcc = 0;
      hooks.slow();
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  return () => {
    running = false;
  };
}
