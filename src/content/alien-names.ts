import type { BuildingId } from './buildings';
import type { UnitId } from './units';
import { L, type Loc } from './text';

interface Label {
  name: Loc;
  description?: Loc;
}

/** Aliens have the same rules, but other names. Humans use the names in the tables. */
export const ALIEN_BUILDINGS: Record<BuildingId, Label> = {
  commandDome: {
    name: L('Brutkern', 'Brood Core'),
    description: L(
      'Das lebende Herz eurer Kolonie. Brütet Drohnen und spuckt Säure auf Feinde.',
      'The living heart of your colony. Breeds drones and spits acid at enemies.',
    ),
  },
  solarField: {
    name: L('Lichtsammler', 'Light Gatherer'),
    description: L(
      'Riesige Blätter, die Sternenlicht trinken.',
      'Giant leaves that drink starlight.',
    ),
  },
  regolithExcavator: {
    name: L('Gesteinsfresser', 'Rock Eater'),
    description: L('Frisst Gestein und gibt Regolith.', 'Eats rock and gives regolith.'),
  },
  habitatDome: {
    name: L('Wohn-Kokon', 'Living Cocoon'),
    description: L(
      'Ein warmer Kokon. Platz für Bewohner und Einheiten.',
      'A warm cocoon. Room for residents and units.',
    ),
  },
  medbay: {
    name: L('Heilnest', 'Healing Nest'),
    description: L(
      'Warme Heilschleim-Becken machen Kranke gesund.',
      'Warm pools of healing slime make the sick healthy.',
    ),
  },
  park: {
    name: L('Sporengarten', 'Spore Garden'),
    description: L(
      'Leuchtende Sporen und weiche Moose. Macht froh.',
      'Glowing spores and soft moss. Makes everyone happy.',
    ),
  },
  storage: {
    name: L('Vorratsblase', 'Storage Bladder'),
    description: L('Eine große Blase für Rohstoffe.', 'A big bladder for resources.'),
  },
  pinkPump: {
    name: L('Saugwurzel', 'Sucking Root'),
    description: L(
      'Saugt pinke Flüssigkeit aus einer Quelle.',
      'Sucks pink liquid out of a spring.',
    ),
  },
  waterOxygenPlant: {
    name: L('Atem-Drüse', 'Breath Gland'),
    description: L(
      'Macht aus pinker Flüssigkeit Wasser und Sauerstoff.',
      'Turns pink liquid into water and oxygen.',
    ),
  },
  greenhouse: {
    name: L('Pilzgarten', 'Fungus Garden'),
    description: L(
      'Leuchtende Pilze. Braucht Wasser, macht Nahrung.',
      'Glowing fungi. Needs water, makes food.',
    ),
  },
  huntingLodge: {
    name: L('Jägernest', 'Hunter Nest'),
    description: L('Brütet Pirscher, die Spinnen jagen.', 'Breeds stalkers that hunt spiders.'),
  },
  lab: {
    name: L('Denkkristall', 'Thinking Crystal'),
    description: L(
      'Ein Kristall voller Wissen. Hier wird geforscht.',
      'A crystal full of knowledge. Research happens here.',
    ),
  },
  diamondDrill: {
    name: L('Kristallwurm', 'Crystal Worm'),
    description: L(
      'Ein Wurm, der Diamanten aus dem Boden holt.',
      'A worm that pulls diamonds out of the ground.',
    ),
  },
  spaceport: {
    name: L('Sporenturm', 'Spore Tower'),
    description: L('Schießt lebende Schiffe ins All.', 'Shoots living ships into space.'),
  },
  barracks: {
    name: L('Kriegerbrut', 'Warrior Brood'),
    description: L(
      'Brütet Alien-Krieger mit Strahlen-Waffen.',
      'Breeds alien warriors with beam weapons.',
    ),
  },
  vehicleFactory: {
    name: L('Panzerbrut', 'Tank Brood'),
    description: L(
      'Brütet schwere Panzerkrabben. Braucht Metall.',
      'Breeds heavy armor crabs. Needs metal.',
    ),
  },
  wall: {
    name: L('Chitinwall', 'Chitin Wall'),
    description: L(
      'Harter Panzer aus Chitin. Hält Bodentruppen auf.',
      'Hard armor made of chitin. Stops ground troops.',
    ),
  },
  turret: {
    name: L('Stachelturm', 'Spike Tower'),
    description: L(
      'Schießt grüne Strahlen auf Feinde in der Nähe.',
      'Shoots green beams at nearby enemies.',
    ),
  },
  shieldReactor: {
    name: L('Schildherz', 'Shield Heart'),
    description: L(
      'Pumpt eine Schutzblase über die Basis. Braucht viel Energie.',
      'Pumps a protective bubble over the base. Needs a lot of energy.',
    ),
  },
  forceField: {
    name: L('Energiemembran', 'Energy Membrane'),
    description: L(
      'Eine leuchtende Haut, die sich selbst heilt.',
      'A glowing skin that heals itself.',
    ),
  },
  airfield: {
    name: L('Nistfelsen', 'Nesting Rock'),
    description: L(
      'Brütet Flugwesen: Stachelflieger und Brutträger.',
      'Breeds flying creatures: spike flyers and brood carriers.',
    ),
  },
  flakTower: {
    name: L('Dornenschleuder', 'Thorn Slinger'),
    description: L('Schießt Dornen auf Flugwesen.', 'Shoots thorns at flying creatures.'),
  },
  orbitalCannon: {
    name: L('Himmelsstachel', 'Sky Spike'),
    description: L(
      'Ein riesiger Stachel. Schießt feindliche Schiffe im Orbit ab.',
      'A giant spike. Shoots down enemy ships in orbit.',
    ),
  },
};

export const ALIEN_UNITS: Record<UnitId, Loc> = {
  drone: L('Bau-Qualle', 'Builder Jelly'),
  hunter: L('Pirscher', 'Stalker'),
  infantry: L('Alien-Krieger', 'Alien Warrior'),
  tank: L('Panzerkrabbe', 'Armor Crab'),
  miningShip: L('Sammler-Schiff', 'Gatherer Ship'),
  transport: L('Sporenschiff', 'Spore Ship'),
  spider: L('Spinnenwesen', 'Spider Creature'),
  flakTank: L('Sporenspucker', 'Spore Spitter'),
  fighter: L('Stachelflieger', 'Spike Flyer'),
  bomber: L('Brutträger', 'Brood Carrier'),
  spaceFighter: L('Schwarmschiff', 'Swarm Ship'),
  cruiser: L('Mutterschiff', 'Mothership'),
};
