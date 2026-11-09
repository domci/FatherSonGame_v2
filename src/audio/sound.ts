import { readPref, writePref } from '../platform/prefs';
import { startAmbient } from './ambient';

export type SfxName =
  | 'shoot'
  | 'impact'
  | 'big_kill'
  | 'hit'
  | 'confirm'
  | 'ui'
  | 'level_up'
  | 'land'
  | 'kill'
  | 'boss';

const SFX: SfxName[] = [
  'shoot',
  'impact',
  'big_kill',
  'hit',
  'confirm',
  'ui',
  'level_up',
  'land',
  'kill',
  'boss',
];
const MIN_GAP_MS = 70;
const AMBIENT_VOLUME = 0.07;
const MUSIC_VOLUME = 0.35;

export interface PlayOpts {
  volume?: number;
  rate?: number;
}

/** Sound effects, battle music and the calm background hum. Starts after the first tap. */
export class Sound {
  sfxOn = readPref('sfx', true);
  musicOn = readPref('music', true);
  private ctx?: AudioContext;
  private sfxGain?: GainNode;
  private ambient?: GainNode;
  private buffers = new Map<SfxName, AudioBuffer>();
  private last = new Map<SfxName, number>();
  private battleMusic?: HTMLAudioElement;
  private battle = false;

  /** Browsers allow sound only after a user gesture. */
  unlock(): void {
    if (this.ctx) {
      void this.ctx.resume();
      return;
    }
    const AC = window.AudioContext as typeof AudioContext | undefined;
    if (!AC) return;
    this.ctx = new AC();
    this.sfxGain = this.ctx.createGain();
    this.sfxGain.connect(this.ctx.destination);
    this.ambient = startAmbient(this.ctx, this.ctx.destination);
    for (const name of SFX) void this.load(name);
    this.battleMusic = new Audio(`${import.meta.env.BASE_URL}audio/battle_theme_a.mp3`);
    this.battleMusic.loop = true;
    this.battleMusic.volume = 0;
    this.applyMusic();
  }

  play(name: SfxName, opts: PlayOpts = {}): void {
    const ctx = this.ctx;
    const buffer = this.buffers.get(name);
    if (!ctx || !buffer || !this.sfxGain || !this.sfxOn) return;
    const now = performance.now();
    if (now - (this.last.get(name) ?? 0) < MIN_GAP_MS) return;
    this.last.set(name, now);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.playbackRate.value = (opts.rate ?? 1) * (0.94 + Math.random() * 0.12);
    const g = ctx.createGain();
    g.gain.value = opts.volume ?? 0.6;
    src.connect(g).connect(this.sfxGain);
    src.start();
  }

  /** Ends all sound (leaving the game). */
  stop(): void {
    this.battleMusic?.pause();
    void this.ctx?.close();
  }

  setBattle(on: boolean): void {
    if (on === this.battle) return;
    this.battle = on;
    this.applyMusic();
  }

  toggleSfx(): boolean {
    this.sfxOn = !this.sfxOn;
    writePref('sfx', this.sfxOn);
    return this.sfxOn;
  }

  toggleMusic(): boolean {
    this.musicOn = !this.musicOn;
    writePref('music', this.musicOn);
    this.applyMusic();
    return this.musicOn;
  }

  private applyMusic(): void {
    const ctx = this.ctx;
    if (!ctx || !this.ambient || !this.battleMusic) return;
    const calm = this.musicOn && !this.battle ? AMBIENT_VOLUME : 0;
    this.ambient.gain.setTargetAtTime(calm, ctx.currentTime, 1.5);
    const m = this.battleMusic;
    if (this.musicOn && this.battle) {
      m.volume = MUSIC_VOLUME;
      void m.play().catch(() => undefined);
    } else m.pause();
  }

  private async load(name: SfxName): Promise<void> {
    if (!this.ctx) return;
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}audio/${name}.ogg`);
      this.buffers.set(name, await this.ctx.decodeAudioData(await res.arrayBuffer()));
    } catch (e) {
      console.warn(`sound ${name} not loaded`, e);
    }
  }
}
