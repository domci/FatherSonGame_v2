import type { GameState, Mark } from '../sim/state';
import type { Entity } from '../sim/entity';
import { factionOf } from '../sim/names';
import { hostile } from '../sim/relations';
import type { Sound, SfxName } from './sound';

const FRESH_MS = 400;
const BATTLE_HOLD_MS = 8000;

/**
 * Battle music: an enemy shoots where the player looks or at the player's home,
 * or an own building shoots. Fights between other peoples far away stay quiet.
 */
function nearFight(state: GameState, e: Entity, zone: string): boolean {
  if (e.building && e.owner === 'player') return true;
  if (!hostile(state, 'player', e.owner) || e.owner === 'wild') return false;
  return e.zone === zone || e.zone === state.players.player?.homeBodyId;
}

const MARK_SOUND: Record<Mark['kind'], { name: SfxName; volume: number }> = {
  unit: { name: 'impact', volume: 0.5 },
  building: { name: 'big_kill', volume: 0.8 },
  spider: { name: 'kill', volume: 0.45 },
  egg: { name: 'hit', volume: 0.3 },
  strike: { name: 'big_kill', volume: 0.7 },
};

/**
 * Turns what happens in the game into sounds: shots, explosions, messages.
 * Only for the surface the player looks at. Battle music while fighting.
 */
export class GameSounds {
  private lastShot = new Map<number, number>();
  private lastMark = 0;
  private eventTime = -1;
  private fightUntil = 0;

  constructor(private sound: Sound) {}

  update(state: GameState, zone: string): void {
    this.shots(state, zone);
    this.marks(state, zone);
    this.messages(state);
    this.sound.setBattle(state.time < this.fightUntil);
  }

  private shots(state: GameState, zone: string): void {
    for (const e of state.world.with('attacker')) {
      const shot = e.attacker.shot;
      if (!shot || this.lastShot.get(e.id) === shot.at) continue;
      this.lastShot.set(e.id, shot.at);
      if (state.time - shot.at > FRESH_MS || e.owner === 'wild') continue;
      if (nearFight(state, e, zone)) this.fightUntil = state.time + BATTLE_HOLD_MS;
      if (e.zone !== zone) continue;
      const alien = factionOf(state, e.owner) === 'alien';
      this.sound.play('shoot', { volume: 0.25, rate: alien ? 0.72 : 1.1 });
    }
  }

  private marks(state: GameState, zone: string): void {
    for (const m of state.marks) {
      if (m.time <= this.lastMark) continue;
      if (m.zone === zone && state.time - m.time < 1500) {
        const s = MARK_SOUND[m.kind];
        this.sound.play(s.name, { volume: s.volume });
      }
    }
    this.lastMark = Math.max(this.lastMark, ...state.marks.map((m) => m.time));
  }

  private messages(state: GameState): void {
    const latest = state.events.at(-1)?.time ?? 0;
    if (this.eventTime < 0) this.eventTime = latest;
    for (const ev of state.events) {
      if (ev.time <= this.eventTime) continue;
      if (ev.kind === 'bad') this.sound.play('boss', { volume: 0.5 });
      else if (ev.kind === 'good') this.sound.play('confirm', { volume: 0.4 });
    }
    this.eventTime = latest;
  }
}
