import {
  GROW_MOOD,
  GROWTH_PER_MINUTE,
  HEAL_PER_MINUTE,
  LEAVE_MOOD,
  LEAVE_PER_MINUTE,
  MIN_PEOPLE,
  MOOD_SPEED,
  NEED_IDS,
  NEEDS_PER_PERSON,
  SICK_PER_MINUTE,
  type NeedId,
} from '../../content/colony';
import { MINUTE } from '../clock';
import { moodTarget } from '../colony';
import { addEvent } from '../game';
import { nameOfBuilding } from '../names';
import { playerStats, type PlayerStats } from '../stats';
import type { ColonyState, GameState, PlayerState } from '../state';
import { amount } from '../wallet';

function missingText(state: GameState, id: NeedId): string {
  const name = (b: 'waterOxygenPlant' | 'greenhouse'): string => nameOfBuilding(state, 'player', b);
  if (id === 'food')
    return `Keine Nahrung mehr! Eure Bewohner werden krank. Hilfe: ${name('greenhouse')} bauen oder Spinnen jagen.`;
  const what = id === 'oxygen' ? 'Kein Sauerstoff' : 'Kein Wasser';
  return `${what} mehr! Eure Bewohner werden krank. Hilfe: ${name('waterOxygenPlant')} bauen.`;
}

/** Everybody breathes, drinks and eats. Returns the share that was missing (0..1). */
function consume(player: PlayerState, minutes: number): number {
  const c = player.colony;
  for (const id of NEED_IDS) {
    const want = c.people * NEEDS_PER_PERSON[id] * minutes;
    const paid = Math.min(amount(player, id), want);
    player.resources[id] = amount(player, id) - paid;
    c.met[id] = want > 0 ? paid / want : 1;
  }
  return 1 - Math.min(...NEED_IDS.map((id) => c.met[id]));
}

function sickness(c: ColonyState, stats: PlayerStats, shortage: number, minutes: number): void {
  if (shortage > 0) c.sick += (c.people - c.sick) * SICK_PER_MINUTE * shortage * minutes;
  else c.sick -= c.sick * HEAL_PER_MINUTE * minutes;
  c.sick -= stats.heals * stats.efficiency * minutes;
  c.sick = Math.max(0, Math.min(c.people, c.sick));
}

function growth(c: ColonyState, stats: PlayerStats, shortage: number, minutes: number): boolean {
  if (c.mood < GROW_MOOD || shortage > 0 || c.people >= stats.residents) return false;
  const moodShare = (c.mood - GROW_MOOD) / (100 - GROW_MOOD);
  c.grow += GROWTH_PER_MINUTE * moodShare * (1 + c.people / 20) * minutes;
  if (c.grow < 1) return false;
  c.grow -= 1;
  c.people += 1;
  return true;
}

function leaving(c: ColonyState, stats: PlayerStats, minutes: number): boolean {
  if (c.people > stats.residents) c.leave += LEAVE_PER_MINUTE * minutes;
  else if (c.mood < LEAVE_MOOD)
    c.leave += (LEAVE_PER_MINUTE * (LEAVE_MOOD - c.mood) * minutes) / LEAVE_MOOD;
  else c.leave = Math.max(0, c.leave - minutes);
  if (c.leave < 1 || c.people <= MIN_PEOPLE) return false;
  c.leave -= 1;
  c.people -= 1;
  c.sick = Math.min(c.sick, c.people);
  return true;
}

/** Messages for the human player: a need ran out, people came or left. */
function report(state: GameState, c: ColonyState, grew: boolean, left: boolean): void {
  for (const id of NEED_IDS) {
    const warned = c.warned.includes(id);
    if (c.met[id] < 0.5 && !warned) {
      c.warned.push(id);
      addEvent(state, missingText(state, id), 'bad');
    } else if (c.met[id] >= 1 && warned) c.warned = c.warned.filter((n) => n !== id);
  }
  if (grew && c.people % 5 === 0)
    addEvent(state, `Die Kolonie wächst: ${c.people} Bewohner.`, 'good');
  if (left)
    addEvent(state, 'Ein Bewohner hat eure Kolonie verlassen. Sorgt für bessere Laune!', 'bad');
}

/** The people in the domes: needs, sickness, mood, new people and people who leave. */
export function colonySystem(state: GameState, dtMs: number): void {
  const minutes = dtMs / MINUTE;
  for (const player of Object.values(state.players)) {
    if (!player) continue;
    const c = player.colony;
    const stats = playerStats(state, player.id);
    const shortage = consume(player, minutes);
    sickness(c, stats, shortage, minutes);
    c.mood += (moodTarget(c, stats) - c.mood) * Math.min(1, MOOD_SPEED * minutes);
    const grew = growth(c, stats, shortage, minutes);
    const left = leaving(c, stats, minutes);
    if (player.id === 'player') report(state, c, grew, left);
  }
}
