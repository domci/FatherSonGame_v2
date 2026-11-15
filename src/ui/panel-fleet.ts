import { viewerOf } from '../sim/viewer';
import type { Session } from '../app/session';
import type { UnitId } from '../content/units';
import type { Entity, PlayerId } from '../sim/entity';
import { nameOfUnit } from '../sim/names';
import { hasResearch } from '../sim/research-helpers';
import { relationOf } from '../sim/relations';
import { blockers, shipsAt, warships } from '../sim/space/places';
import { action, stat, text } from './panel-kit';
import { t, tx } from '../i18n';

/** "2× Kreuzer, 1× Raumjäger" */
function listOf(session: Session, ships: Entity[]): string {
  const counts = new Map<string, number>();
  const owners = new Map<string, PlayerId | undefined>();
  for (const s of ships) {
    if (!s.unit) continue;
    const key = `${s.owner}:${s.unit.type}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
    owners.set(key, s.owner);
  }
  return [...counts]
    .map(([key, n]) => {
      const type = key.split(':')[1] as UnitId;
      return `${n}× ${tx(nameOfUnit(session.state, owners.get(key), type))}`;
    })
    .join(', ');
}

/** War ships of other sides that are not at war with you (allies and peace). */
function friendsAt(session: Session, place: string): Entity[] {
  const s = session.state;
  return shipsAt(s, place).filter(
    (e) => e.owner && e.owner !== viewerOf(s) && relationOf(s, viewerOf(s), e.owner) !== 'war',
  );
}

/** Own and enemy war ships at a planet or the belt, and the button to send the fleet there. */
export function fleetRows(session: Session, place: string): HTMLElement[] {
  const s = session.state;
  const rows: HTMLElement[] = [];
  const mine = shipsAt(s, place, viewerOf(s));
  const theirs = blockers(s, viewerOf(s), place);
  const friends = friendsAt(session, place);
  const coming = warships(s).filter((e) => e.owner === viewerOf(s) && e.orbit?.to === place);
  if (mine.length) rows.push(stat('orbit', t('fleetHere'), listOf(session, mine), '#7cff6b'));
  if (friends.length)
    rows.push(stat('handshake', t('friendsOrbit'), listOf(session, friends), '#5fd0ff'));
  if (coming.length) rows.push(stat('rocket', t('comingHere'), String(coming.length), '#c9d4e3'));
  if (theirs.length) {
    rows.push(stat('crosshair', t('enemiesOrbit'), listOf(session, theirs), '#ff6b81'));
    rows.push(text(t('blockade'), 'p-text bad'));
  }
  const ready = warships(s).filter(
    (e) => e.owner === session.me && e.orbit && !e.orbit.to && e.orbit.at !== place,
  );
  if (ready.length)
    rows.push(
      action('rocket', t('sendFleet', { n: ready.length }), {
        title: t('sendFleetHelp'),
        onclick: () => void session.command({ type: 'fleet', player: session.me, targetId: place }),
      }),
    );
  else if (!mine.length && hasResearch(s, viewerOf(s), 'warships'))
    rows.push(text(t('noWarships'), 'p-text muted'));
  return rows;
}

/** Changes when the fleet rows must be rebuilt. */
export function fleetKey(session: Session): string {
  return warships(session.state)
    .map((e) => `${e.id}:${e.orbit?.at}:${e.orbit?.to ?? ''}`)
    .join();
}
