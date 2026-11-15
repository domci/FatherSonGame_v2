import { q, type QuizQuestion } from './types';

/** Physik, part 2. The first answer is always the right one. */
export const PHYSICS_2: readonly QuizQuestion[] = [
  q(
    'physics',
    'ice',
    [
      'Warum schwimmt Eis auf dem Wasser?',
      [
        'Eis ist leichter als gleich viel Wasser',
        'Im Eis sind Löcher',
        'Eis ist wärmer als Wasser',
        'Das Wasser stößt kaltes Eis ab',
      ],
      'Wasser dehnt sich beim Gefrieren aus. Darum ist Eis leichter als gleich viel Wasser.',
    ],
    [
      'Why does ice float on water?',
      [
        'Ice is lighter than the same amount of water',
        'There are holes in the ice',
        'Ice is warmer than water',
        'The water pushes cold ice away',
      ],
      'Water expands when it freezes. That is why ice is lighter than the same amount of water.',
    ],
    12,
  ),
  q(
    'physics',
    'volt',
    [
      'In welcher Einheit misst man elektrische Spannung?',
      ['Volt', 'Meter', 'Kilogramm', 'Grad'],
      'Eine Steckdose in Deutschland hat 230 Volt.',
    ],
    [
      'In which unit do you measure electric voltage?',
      ['Volt', 'Meter', 'Kilogram', 'Degree'],
      'A wall socket in Germany has 230 volts.',
    ],
  ),
  q(
    'physics',
    'solar',
    [
      'Was macht eine Solarzelle?',
      [
        'Sie macht aus Licht Strom',
        'Sie macht aus Strom Licht',
        'Sie speichert Wasser',
        'Sie kühlt',
      ],
      'Genau wie die Solarfelder in eurer Basis.',
    ],
    [
      'What does a solar cell do?',
      [
        'It turns light into electricity',
        'It turns electricity into light',
        'It stores water',
        'It cools',
      ],
      'Just like the solar fields in your base.',
    ],
  ),
  q(
    'physics',
    'moon-jump',
    [
      'Warum kann man auf dem Mond viel höher springen?',
      [
        'Der Mond hat weniger Schwerkraft',
        'Auf dem Mond gibt es keine Luft',
        'Der Mond ist näher an der Sonne',
        'Der Raumanzug hat Federn',
      ],
      'Auf dem Mond wiegt man nur etwa ein Sechstel so viel wie auf der Erde.',
    ],
    [
      'Why can you jump much higher on the Moon?',
      [
        'The Moon has less gravity',
        'There is no air on the Moon',
        'The Moon is closer to the Sun',
        'The space suit has springs',
      ],
      'On the Moon you only weigh about one sixth of what you weigh on Earth.',
    ],
  ),
];
