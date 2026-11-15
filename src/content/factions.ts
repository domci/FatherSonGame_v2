import { BUILDINGS, type BuildingId } from './buildings';
import { UNITS, type UnitId } from './units';
import { L, type Loc } from './text';
import { ALIEN_BUILDINGS, ALIEN_UNITS } from './alien-names';

export type Faction = 'human' | 'alien';

export interface FactionInfo {
  id: Faction;
  name: Loc;
  /** Short text for the faction choice. */
  pitch: Loc;
  /** First message of a new game. */
  intro: Loc;
  /** Name of the main building (lose it = lose the game). */
  core: Loc;
}

export const FACTIONS: Record<Faction, FactionInfo> = {
  human: {
    id: 'human',
    name: L('Menschen', 'Humans'),
    pitch: L(
      'Gestrandete Siedler mit Glaskuppeln, Robotern und gelben Lasern.',
      'Stranded settlers with glass domes, robots and yellow lasers.',
    ),
    intro: L('Bruchlandung! Baut eure Basis auf.', 'Crash landing! Build up your base.'),
    core: L('Kommando-Kuppel', 'Command Dome'),
  },
  alien: {
    id: 'alien',
    name: L('Aliens', 'Aliens'),
    pitch: L(
      'Ein uraltes Volk. Lebende Gebäude, leuchtende Kristalle, grüne Strahlen.',
      'An ancient people. Living buildings, glowing crystals, green beams.',
    ),
    intro: L(
      'Der Brutkern ist erwacht. Lasst eure Kolonie wachsen!',
      'The Brood Core has awoken. Let your colony grow!',
    ),
    core: L('Brutkern', 'Brood Core'),
  },
};

export function buildingName(id: BuildingId, faction: Faction): Loc {
  return faction === 'alien' ? ALIEN_BUILDINGS[id].name : BUILDINGS[id].name;
}

export function buildingDescription(id: BuildingId, faction: Faction): Loc {
  const alien = ALIEN_BUILDINGS[id].description;
  return faction === 'alien' && alien ? alien : BUILDINGS[id].description;
}

export function unitName(id: UnitId, faction: Faction): Loc {
  return faction === 'alien' ? ALIEN_UNITS[id] : UNITS[id].name;
}

export function otherFaction(f: Faction): Faction {
  return f === 'human' ? 'alien' : 'human';
}
