import type { Session } from '../app/session';
import type { UnitId } from '../content/units';
import type { Entity, PlayerId } from '../sim/entity';
import { nameOfUnit } from '../sim/names';
import { hasResearch } from '../sim/research-helpers';
import { shipsAt, warships } from '../sim/space/places';
import { action, stat, text } from './panel-kit';

/** "2× Kreuzer, 1× Raumjäger" */
function listOf(session: Session, owner: PlayerId, ships: Entity[]): string {
  const counts = new Map<UnitId, number>();
  for (const s of ships) if (s.unit) counts.set(s.unit.type, (counts.get(s.unit.type) ?? 0) + 1);
  return [...counts].map(([t, n]) => `${n}× ${nameOfUnit(session.state, owner, t)}`).join(', ');
}

/** Own and enemy war ships at a planet or the belt, and the button to send the fleet there. */
export function fleetRows(session: Session, place: string): HTMLElement[] {
  const s = session.state;
  const rows: HTMLElement[] = [];
  const mine = shipsAt(s, place, 'player');
  const theirs = shipsAt(s, place, 'ai');
  const coming = warships(s).filter((e) => e.owner === 'player' && e.orbit?.to === place);
  if (mine.length)
    rows.push(stat('orbit', 'Eure Flotte hier', listOf(session, 'player', mine), '#7cff6b'));
  if (coming.length)
    rows.push(stat('rocket', 'Unterwegs hierher', String(coming.length), '#c9d4e3'));
  if (theirs.length) {
    rows.push(stat('crosshair', 'Feinde im Orbit', listOf(session, 'ai', theirs), '#ff6b81'));
    rows.push(text('Blockade: Mining- und Transportschiffe werden hier beschossen.', 'p-text bad'));
  }
  const ready = warships(s).filter(
    (e) => e.owner === 'player' && e.orbit && !e.orbit.to && e.orbit.at !== place,
  );
  if (ready.length)
    rows.push(
      action('rocket', `Flotte hierher schicken (${ready.length} Schiffe)`, {
        title: 'Alle wartenden Kampfschiffe fliegen hierher.',
        onclick: () => void session.command({ type: 'fleet', player: 'player', targetId: place }),
      }),
    );
  else if (!mine.length && hasResearch(s, 'player', 'warships'))
    rows.push(text('Keine freien Kampfschiffe. Baut welche im Raumhafen.', 'p-text muted'));
  return rows;
}

/** Changes when the fleet rows must be rebuilt. */
export function fleetKey(session: Session): string {
  return warships(session.state)
    .map((e) => `${e.id}:${e.orbit?.at}:${e.orbit?.to ?? ''}`)
    .join();
}
