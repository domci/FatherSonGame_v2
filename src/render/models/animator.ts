import {
  AnimationMixer,
  type AnimationAction,
  type AnimationClip,
  type Object3D,
} from 'three/webgpu';

export type Pose = 'idle' | 'move' | 'attack';

const PATTERN: Record<Pose, RegExp> = {
  idle: /\|Idle$/,
  move: /\|(Run|Walk)$/,
  attack: /\|(Shoot|Attack)$/,
};

/** Plays the right animation clip (idle, move, attack) with a short cross-fade. */
export class Animator {
  private mixer: AnimationMixer;
  private actions = new Map<Pose, AnimationAction>();
  private pose?: Pose;

  constructor(root: Object3D, clips: AnimationClip[]) {
    this.mixer = new AnimationMixer(root);
    for (const pose of Object.keys(PATTERN) as Pose[]) {
      const clip = clips.find((c) => PATTERN[pose].test(c.name));
      if (clip) this.actions.set(pose, this.mixer.clipAction(clip));
    }
    this.mixer.timeScale = 1 + Math.random() * 0.1;
  }

  set(pose: Pose): void {
    if (pose === this.pose) return;
    const next = this.actions.get(pose) ?? this.actions.get('idle');
    const prev = this.pose ? this.actions.get(this.pose) : undefined;
    this.pose = pose;
    if (!next || next === prev) return;
    next.reset().play();
    if (prev) next.crossFadeFrom(prev, 0.2, false);
  }

  update(dtSeconds: number): void {
    this.mixer.update(dtSeconds);
  }
}
