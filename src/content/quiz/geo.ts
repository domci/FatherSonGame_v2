import { q, type QuizQuestion } from './types';

/** Erdkunde. The first answer is always the right one. German first, then English. */
export const GEO: readonly QuizQuestion[] = [
  q(
    'geo',
    'berlin',
    [
      'Was ist die Hauptstadt von Deutschland?',
      ['Berlin', 'München', 'Hamburg', 'Bonn'],
      'Seit 1990 ist Berlin die Hauptstadt. Vorher war Bonn die Hauptstadt von Westdeutschland.',
    ],
    [
      'What is the capital of Germany?',
      ['Berlin', 'Munich', 'Hamburg', 'Bonn'],
      'Berlin has been the capital since 1990. Before that, Bonn was the capital of West Germany.',
    ],
  ),
  q(
    'geo',
    'ocean',
    [
      'Welcher ist der größte Ozean?',
      ['Pazifik', 'Atlantik', 'Indischer Ozean', 'Arktischer Ozean'],
      'Der Pazifik ist größer als alle Kontinente zusammen.',
    ],
    [
      'Which is the biggest ocean?',
      ['Pacific', 'Atlantic', 'Indian Ocean', 'Arctic Ocean'],
      'The Pacific is bigger than all continents together.',
    ],
  ),
  q(
    'geo',
    'everest',
    [
      'Welcher ist der höchste Berg der Erde?',
      ['Mount Everest', 'Zugspitze', 'Kilimandscharo', 'Mont Blanc'],
      'Der Mount Everest im Himalaya ist fast 8850 Meter hoch.',
    ],
    [
      'Which is the highest mountain on Earth?',
      ['Mount Everest', 'Zugspitze', 'Kilimanjaro', 'Mont Blanc'],
      'Mount Everest in the Himalayas is almost 8850 meters high.',
    ],
  ),
  q(
    'geo',
    'egypt',
    [
      'Auf welchem Kontinent liegt Ägypten?',
      ['Afrika', 'Asien', 'Europa', 'Südamerika'],
      'Ägypten liegt im Nordosten von Afrika. Dort fließt der Nil.',
    ],
    [
      'On which continent is Egypt?',
      ['Africa', 'Asia', 'Europe', 'South America'],
      'Egypt is in the north-east of Africa. The Nile flows there.',
    ],
  ),
  q(
    'geo',
    'cologne',
    [
      'Welcher Fluss fließt durch Köln?',
      ['Rhein', 'Elbe', 'Donau', 'Main'],
      'Der Rhein fließt von den Alpen bis in die Nordsee.',
    ],
    [
      'Which river flows through Cologne?',
      ['Rhine', 'Elbe', 'Danube', 'Main'],
      'The Rhine flows from the Alps to the North Sea.',
    ],
  ),
  q(
    'geo',
    'biggest-country',
    [
      'Welches Land ist das größte der Erde?',
      ['Russland', 'China', 'USA', 'Kanada'],
      'Russland ist viel größer als Kanada, das zweitgrößte Land der Erde.',
    ],
    [
      'Which country is the biggest on Earth?',
      ['Russia', 'China', 'USA', 'Canada'],
      'Russia is much bigger than Canada, the second biggest country on Earth.',
    ],
  ),
  q(
    'geo',
    'penguins',
    [
      'Wo leben die meisten wilden Pinguine?',
      ['Auf der Südhalbkugel', 'Am Nordpol', 'In der Sahara', 'In den Alpen'],
      'Am Nordpol gibt es keine wilden Pinguine. Dort leben Eisbären.',
    ],
    [
      'Where do most wild penguins live?',
      ['In the southern hemisphere', 'At the North Pole', 'In the Sahara', 'In the Alps'],
      'There are no wild penguins at the North Pole. Polar bears live there.',
    ],
  ),
  q(
    'geo',
    'north-sea',
    [
      'Welches Meer liegt im Norden von Deutschland?',
      ['Die Nordsee', 'Das Mittelmeer', 'Das Schwarze Meer', 'Das Rote Meer'],
      'Im Norden liegen die Nordsee und die Ostsee.',
    ],
    [
      'Which sea is in the north of Germany?',
      ['The North Sea', 'The Mediterranean Sea', 'The Black Sea', 'The Red Sea'],
      'In the north are the North Sea and the Baltic Sea.',
    ],
  ),
  q(
    'geo',
    'compass',
    [
      'Wohin zeigt die Nadel eines Kompasses?',
      ['Nach Norden', 'Nach Süden', 'Zur Sonne', 'Zum nächsten Berg'],
      'Die Nadel ist ein kleiner Magnet. Sie richtet sich nach dem Magnetfeld der Erde.',
    ],
    [
      'Where does the needle of a compass point?',
      ['To the north', 'To the south', 'To the sun', 'To the next mountain'],
      'The needle is a small magnet. It follows the magnetic field of the Earth.',
    ],
  ),
  q(
    'geo',
    'sahara',
    [
      'Wie heißt die größte heiße Wüste der Erde?',
      ['Sahara', 'Gobi', 'Atacama', 'Kalahari'],
      'Die Sahara liegt in Afrika. Die Antarktis ist eine noch größere, aber eiskalte Wüste.',
    ],
    [
      'What is the name of the biggest hot desert on Earth?',
      ['Sahara', 'Gobi', 'Atacama', 'Kalahari'],
      'The Sahara is in Africa. Antarctica is an even bigger desert, but it is ice cold.',
    ],
  ),
  q(
    'geo',
    'equator',
    [
      'Was ist der Äquator?',
      [
        'Eine gedachte Linie um die Mitte der Erde',
        'Ein Fluss in Afrika',
        'Ein hohes Gebirge',
        'Eine Stadt in Südamerika',
      ],
      'Der Äquator teilt die Erde in eine Nordhalbkugel und eine Südhalbkugel.',
    ],
    [
      'What is the equator?',
      [
        'An imaginary line around the middle of the Earth',
        'A river in Africa',
        'A high mountain range',
        'A city in South America',
      ],
      'The equator divides the Earth into a northern and a southern hemisphere.',
    ],
  ),
  q(
    'geo',
    'states',
    [
      'Wie viele Bundesländer hat Deutschland?',
      ['16', '12', '10', '20'],
      'Zum Beispiel Bayern, Hamburg und Nordrhein-Westfalen.',
    ],
    [
      'How many federal states does Germany have?',
      ['16', '12', '10', '20'],
      'For example Bavaria, Hamburg and North Rhine-Westphalia.',
    ],
  ),
];
