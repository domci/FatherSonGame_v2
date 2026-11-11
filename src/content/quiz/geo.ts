import { q, type QuizQuestion } from './types';

/** Erdkunde. The first answer is always the right one. */
export const GEO: readonly QuizQuestion[] = [
  q(
    'geo',
    'berlin',
    'Was ist die Hauptstadt von Deutschland?',
    ['Berlin', 'München', 'Hamburg', 'Bonn'],
    'Seit 1990 ist Berlin die Hauptstadt. Vorher war Bonn die Hauptstadt von Westdeutschland.',
  ),
  q(
    'geo',
    'ocean',
    'Welcher ist der größte Ozean?',
    ['Pazifik', 'Atlantik', 'Indischer Ozean', 'Arktischer Ozean'],
    'Der Pazifik ist größer als alle Kontinente zusammen.',
  ),
  q(
    'geo',
    'everest',
    'Welcher ist der höchste Berg der Erde?',
    ['Mount Everest', 'Zugspitze', 'Kilimandscharo', 'Mont Blanc'],
    'Der Mount Everest im Himalaya ist fast 8850 Meter hoch.',
  ),
  q(
    'geo',
    'egypt',
    'Auf welchem Kontinent liegt Ägypten?',
    ['Afrika', 'Asien', 'Europa', 'Südamerika'],
    'Ägypten liegt im Nordosten von Afrika. Dort fließt der Nil.',
  ),
  q(
    'geo',
    'cologne',
    'Welcher Fluss fließt durch Köln?',
    ['Rhein', 'Elbe', 'Donau', 'Main'],
    'Der Rhein fließt von den Alpen bis in die Nordsee.',
  ),
  q(
    'geo',
    'biggest-country',
    'Welches Land ist das größte der Erde?',
    ['Russland', 'China', 'USA', 'Kanada'],
    'Russland ist viel größer als Kanada, das zweitgrößte Land der Erde.',
  ),
  q(
    'geo',
    'penguins',
    'Wo leben die meisten wilden Pinguine?',
    ['Auf der Südhalbkugel', 'Am Nordpol', 'In der Sahara', 'In den Alpen'],
    'Am Nordpol gibt es keine wilden Pinguine. Dort leben Eisbären.',
  ),
  q(
    'geo',
    'north-sea',
    'Welches Meer liegt im Norden von Deutschland?',
    ['Die Nordsee', 'Das Mittelmeer', 'Das Schwarze Meer', 'Das Rote Meer'],
    'Im Norden liegen die Nordsee und die Ostsee.',
  ),
  q(
    'geo',
    'compass',
    'Wohin zeigt die Nadel eines Kompasses?',
    ['Nach Norden', 'Nach Süden', 'Zur Sonne', 'Zum nächsten Berg'],
    'Die Nadel ist ein kleiner Magnet. Sie richtet sich nach dem Magnetfeld der Erde.',
  ),
  q(
    'geo',
    'sahara',
    'Wie heißt die größte heiße Wüste der Erde?',
    ['Sahara', 'Gobi', 'Atacama', 'Kalahari'],
    'Die Sahara liegt in Afrika. Die Antarktis ist eine noch größere, aber eiskalte Wüste.',
  ),
  q(
    'geo',
    'equator',
    'Was ist der Äquator?',
    [
      'Eine gedachte Linie um die Mitte der Erde',
      'Ein Fluss in Afrika',
      'Ein hohes Gebirge',
      'Eine Stadt in Südamerika',
    ],
    'Der Äquator teilt die Erde in eine Nordhalbkugel und eine Südhalbkugel.',
  ),
  q(
    'geo',
    'states',
    'Wie viele Bundesländer hat Deutschland?',
    ['16', '12', '10', '20'],
    'Zum Beispiel Bayern, Hamburg und Nordrhein-Westfalen.',
  ),
];
