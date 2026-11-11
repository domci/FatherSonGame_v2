import { BUILDINGS, type BuildingId } from './buildings';
import { UNITS, type UnitId } from './units';

export type Faction = 'human' | 'alien';

interface Label {
  name: string;
  description?: string;
}

export interface FactionInfo {
  id: Faction;
  name: string;
  /** Short text for the faction choice. */
  pitch: string;
  /** First message of a new game. */
  intro: string;
  /** Name of the main building (lose it = lose the game). */
  core: string;
}

export const FACTIONS: Record<Faction, FactionInfo> = {
  human: {
    id: 'human',
    name: 'Menschen',
    pitch: 'Gestrandete Siedler mit Glaskuppeln, Robotern und gelben Lasern.',
    intro: 'Bruchlandung! Baut eure Basis auf.',
    core: 'Kommando-Kuppel',
  },
  alien: {
    id: 'alien',
    name: 'Aliens',
    pitch: 'Ein uraltes Volk. Lebende Gebäude, leuchtende Kristalle, grüne Strahlen.',
    intro: 'Der Brutkern ist erwacht. Lasst eure Kolonie wachsen!',
    core: 'Brutkern',
  },
};

/** Aliens have the same rules, but other names. Humans use the names in the tables. */
const ALIEN_BUILDINGS: Record<BuildingId, Label> = {
  commandDome: {
    name: 'Brutkern',
    description: 'Das lebende Herz eurer Kolonie. Brütet Drohnen und spuckt Säure auf Feinde.',
  },
  solarField: { name: 'Lichtsammler', description: 'Riesige Blätter, die Sternenlicht trinken.' },
  regolithExcavator: { name: 'Gesteinsfresser', description: 'Frisst Gestein und gibt Regolith.' },
  habitatDome: { name: 'Wohn-Kokon', description: 'Ein warmer Kokon. Platz für mehr Einheiten.' },
  storage: { name: 'Vorratsblase', description: 'Eine große Blase für Rohstoffe.' },
  pinkPump: { name: 'Saugwurzel', description: 'Saugt pinke Flüssigkeit aus einer Quelle.' },
  waterOxygenPlant: {
    name: 'Atem-Drüse',
    description: 'Macht aus pinker Flüssigkeit Wasser und Sauerstoff.',
  },
  greenhouse: {
    name: 'Pilzgarten',
    description: 'Leuchtende Pilze. Braucht Wasser, macht Nahrung.',
  },
  huntingLodge: { name: 'Jägernest', description: 'Brütet Pirscher, die Spinnen jagen.' },
  lab: { name: 'Denkkristall', description: 'Ein Kristall voller Wissen. Hier wird geforscht.' },
  diamondDrill: {
    name: 'Kristallwurm',
    description: 'Ein Wurm, der Diamanten aus dem Boden holt.',
  },
  spaceport: { name: 'Sporenturm', description: 'Schießt lebende Schiffe ins All.' },
  barracks: { name: 'Kriegerbrut', description: 'Brütet Alien-Krieger mit Strahlen-Waffen.' },
  vehicleFactory: {
    name: 'Panzerbrut',
    description: 'Brütet schwere Panzerkrabben. Braucht Metall.',
  },
  wall: { name: 'Chitinwall', description: 'Harter Panzer aus Chitin. Hält Bodentruppen auf.' },
  turret: { name: 'Stachelturm', description: 'Schießt grüne Strahlen auf Feinde in der Nähe.' },
  shieldReactor: {
    name: 'Schildherz',
    description: 'Pumpt eine Schutzblase über die Basis. Braucht viel Energie.',
  },
  forceField: {
    name: 'Energiemembran',
    description: 'Eine leuchtende Haut, die sich selbst heilt.',
  },
  airfield: { name: 'Nistfelsen', description: 'Brütet Flugwesen: Stachelflieger und Brutträger.' },
  flakTower: { name: 'Dornenschleuder', description: 'Schießt Dornen auf Flugwesen.' },
  orbitalCannon: {
    name: 'Himmelsstachel',
    description: 'Ein riesiger Stachel. Schießt feindliche Schiffe im Orbit ab.',
  },
};

const ALIEN_UNITS: Record<UnitId, string> = {
  drone: 'Bau-Qualle',
  hunter: 'Pirscher',
  infantry: 'Alien-Krieger',
  tank: 'Panzerkrabbe',
  miningShip: 'Sammler-Schiff',
  transport: 'Sporenschiff',
  spider: 'Spinnenwesen',
  flakTank: 'Sporenspucker',
  fighter: 'Stachelflieger',
  bomber: 'Brutträger',
  spaceFighter: 'Schwarmschiff',
  cruiser: 'Mutterschiff',
};

export function buildingName(id: BuildingId, faction: Faction): string {
  return faction === 'alien' ? ALIEN_BUILDINGS[id].name : BUILDINGS[id].name;
}

export function buildingDescription(id: BuildingId, faction: Faction): string {
  const alien = ALIEN_BUILDINGS[id].description;
  return faction === 'alien' && alien ? alien : BUILDINGS[id].description;
}

export function unitName(id: UnitId, faction: Faction): string {
  return faction === 'alien' ? ALIEN_UNITS[id] : UNITS[id].name;
}

export function otherFaction(f: Faction): Faction {
  return f === 'human' ? 'alien' : 'human';
}
