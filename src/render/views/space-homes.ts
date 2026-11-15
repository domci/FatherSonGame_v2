import { sidesOf } from '../../sim/relations';
import type { GameState } from '../../sim/state';
import { viewerOf } from '../../sim/viewer';
import type { Faction } from '../../content/factions';
import type { Body } from '../../sim/generation/solar-system';
import { SpaceBody, type HomeOf } from './space-bodies';

/** How a planet looks for this device: own home, home of another side, or nobody's. */
interface BodyLook {
  kind: 'home' | 'enemy' | 'other';
  faction: Faction;
  owner?: HomeOf;
  key: string;
}

function lookOf(state: GameState, body: Body): BodyLook {
  const me = viewerOf(state);
  const faction = state.players[me]?.faction ?? 'human';
  const side = sidesOf(state).find((id) => state.players[id]?.homeBodyId === body.id);
  const p = side ? state.players[side] : undefined;
  if (!side || !p) return { kind: 'other', faction, key: 'other' };
  if (side === me) return { kind: 'home', faction, key: `home:${faction}` };
  const owner = { name: p.name, color: p.color };
  return { kind: 'enemy', faction: p.faction, owner, key: `${side}:${p.faction}:${p.name}` };
}

/** Changes since the last look: planets added, people came or left (cheap to compare). */
export function homesKey(state: GameState): string {
  const sides = sidesOf(state).map((id) => {
    const p = state.players[id];
    return `${id}:${p?.homeBodyId}:${p?.faction}:${p?.name}`;
  });
  return `${viewerOf(state)}|${state.system.bodies.length}|${sides.join(',')}`;
}

/** The planet in space, made new when its look has changed (else undefined). */
export function refreshBody(state: GameState, body: Body, old?: SpaceBody): SpaceBody | undefined {
  const look = lookOf(state, body);
  if (old?.key === look.key) return undefined;
  const made = new SpaceBody(body, look.kind, look.faction, look.owner);
  made.key = look.key;
  return made;
}
