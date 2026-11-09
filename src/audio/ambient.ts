/**
 * Calm background sound made in code: a low, slowly breathing hum
 * (two detuned oscillators through a moving low-pass filter).
 */
export function startAmbient(ctx: AudioContext, out: AudioNode): GainNode {
  const gain = ctx.createGain();
  gain.gain.value = 0;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 260;
  filter.Q.value = 6;
  filter.connect(gain).connect(out);
  for (const [freq, detune] of [
    [55, -7],
    [82.5, 5],
    [110, 0],
  ] as const) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    osc.detune.value = detune;
    const g = ctx.createGain();
    g.gain.value = freq === 110 ? 0.12 : 0.3;
    osc.connect(g).connect(filter);
    osc.start();
  }
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.07;
  const depth = ctx.createGain();
  depth.gain.value = 140;
  lfo.connect(depth).connect(filter.frequency);
  lfo.start();
  return gain;
}
