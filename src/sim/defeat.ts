import { FACTIONS } from '../content/factions';
import type { Mark } from './state';
import type { PlayerId, SideId } from './entity';
import { addEvent } from './game';
import { isOnline, tell, tellHumans } from './humans';
import { aliveSides, allied, hostileSides, isSide } from './relations';
import type { GameState } from './state';

/** You (and your allies) win when only you and your allies are left. Online worlds never end. */
export function checkVictory(state: GameState): void {
  if (isOnline(state) || state.winner) return;
  if (!state.players.player || state.players.player.defeated) return;
  const others = aliveSides(state).filter((id) => id !== 'player');
  if (others.length > 0 && others.every((id) => allied(state, 'player', id)))
    state.winner = 'player';
  else if (others.length === 0 && state.settings.opponent) state.winner = 'player';
}

/** A side lost its main dome: it is out of the game. Its things fall apart in the next step. */
export function defeat(state: GameState, side: SideId, by?: PlayerId): void {
  const p = state.players[side];
  if (!p || p.defeated) return;
  p.defeated = true;
  state.offers = state.offers.filter((o) => o.from !== side && o.to !== side);
  const core = FACTIONS[p.faction].core;
  if (side === 'player' && !isOnline(state)) {
    addEvent(state, `${core} zerstört!`, 'bad');
    state.winner ??= isSide(by) ? by : (hostileSides(state, 'player')[0] ?? 'ai');
    return;
  }
  tell(state, side, `${core} zerstört! Ihr seid besiegt. Ihr könnt neu anfangen.`, 'bad');
  tellHumans(state, (h) =>
    h === side
      ? undefined
      : [`${core} zerstört: ${p.name} ist besiegt!`, allied(state, h, side) ? 'bad' : 'good'],
  );
  checkVictory(state);
}

function markKind(building: boolean): Mark['kind'] {
  return building ? 'building' : 'unit';
}

/** Removes everything of beaten sides (with explosions). Not yours in a game on this device (end screen). */
export function defeatSystem(state: GameState): void {
  const gone = new Set<PlayerId>();
  for (const p of Object.values(state.players))
    if (p?.defeated && (p.id !== 'player' || isOnline(state))) gone.add(p.id);
  if (gone.size === 0) return;
  const list = state.world.entities.filter((e) => !!e.owner && gone.has(e.owner));
  for (const e of list) {
    if (e.position && e.zone && !e.aboard) {
      const { x, y } = e.position;
      const kind = markKind(!!e.building);
      state.marks.push({ time: state.time, zone: e.zone, x, y, kind, owner: e.owner });
    }
    state.world.remove(e);
  }
}
