import { q, type QuizQuestion } from './types';

/** Physik. The first answer is always the right one. German first, then English. */
export const PHYSICS: readonly QuizQuestion[] = [
  q(
    'physics',
    'boil',
    [
      'Bei wie viel Grad Celsius kocht Wasser (auf Höhe des Meeres)?',
      ['100 °C', '50 °C', '212 °C', '75 °C'],
      'Wasser kocht bei 100 °C. In Fahrenheit sind das 212 Grad. Auf hohen Bergen kocht es früher.',
    ],
    [
      'At how many degrees Celsius does water boil (at sea level)?',
      ['100 °C', '50 °C', '212 °C', '75 °C'],
      'Water boils at 100 °C. In Fahrenheit that is 212 degrees. On high mountains it boils earlier.',
    ],
  ),
  q(
    'physics',
    'freeze',
    [
      'Bei wie viel Grad Celsius gefriert Wasser?',
      ['0 °C', '10 °C', '-20 °C', '4 °C'],
      'Unter 0 °C wird Wasser zu Eis.',
    ],
    [
      'At how many degrees Celsius does water freeze?',
      ['0 °C', '10 °C', '-20 °C', '4 °C'],
      'Below 0 °C water turns into ice.',
    ],
  ),
  q(
    'physics',
    'thunder',
    [
      'Warum sieht man den Blitz vor dem Donner?',
      [
        'Licht ist viel schneller als Schall',
        'Der Donner ist leiser',
        'Die Augen sind schneller als die Ohren',
        'Der Blitz ist näher',
      ],
      'Licht schafft 300 000 km pro Sekunde, Schall nur etwa 340 Meter.',
    ],
    [
      'Why do you see the lightning before the thunder?',
      [
        'Light is much faster than sound',
        'The thunder is quieter',
        'The eyes are faster than the ears',
        'The lightning is closer',
      ],
      'Light travels 300,000 km per second, sound only about 340 meters.',
    ],
  ),
  q(
    'physics',
    'gravity',
    [
      'Welche Kraft zieht Dinge zum Boden der Erde?',
      ['Schwerkraft', 'Magnetkraft', 'Windkraft', 'Muskelkraft'],
      'Die Schwerkraft zieht alles zur Erde. Auch der Mond wird so festgehalten.',
    ],
    [
      'Which force pulls things to the ground of the Earth?',
      ['Gravity', 'Magnetic force', 'Wind force', 'Muscle power'],
      'Gravity pulls everything to the Earth. It also holds the Moon in place.',
    ],
  ),
  q(
    'physics',
    'space-sound',
    [
      'Kann man im Weltall Schall hören?',
      [
        'Nein, dort gibt es keine Luft',
        'Ja, sogar lauter als auf der Erde',
        'Ja, aber nur hohe Töne',
        'Nur in der Nähe der Sonne',
      ],
      'Schall braucht Luft, Wasser oder einen anderen Stoff. Im leeren All ist es still.',
    ],
    [
      'Can you hear sound in space?',
      [
        'No, there is no air there',
        'Yes, even louder than on Earth',
        'Yes, but only high sounds',
        'Only close to the Sun',
      ],
      'Sound needs air, water or some other material. In empty space it is quiet.',
    ],
  ),
  q(
    'physics',
    'prism',
    [
      'Was passiert, wenn weißes Licht durch ein Glas-Prisma geht?',
      ['Es teilt sich in bunte Farben', 'Es wird dunkel', 'Es wird heiß', 'Es wird grün'],
      'Weißes Licht besteht aus allen Farben. So entsteht auch ein Regenbogen.',
    ],
    [
      'What happens when white light goes through a glass prism?',
      ['It splits into bright colors', 'It gets dark', 'It gets hot', 'It turns green'],
      'White light is made of all colors. That is also how a rainbow forms.',
    ],
  ),
  q(
    'physics',
    'magnet',
    [
      'Welches Metall zieht ein Magnet an?',
      ['Eisen', 'Gold', 'Kupfer', 'Aluminium'],
      'Eisen, Nickel und Kobalt sind magnetisch. Gold, Kupfer und Aluminium nicht.',
    ],
    [
      'Which metal does a magnet pull?',
      ['Iron', 'Gold', 'Copper', 'Aluminium'],
      'Iron, nickel and cobalt are magnetic. Gold, copper and aluminium are not.',
    ],
  ),
  q(
    'physics',
    'fire',
    [
      'Was braucht ein Feuer zum Brennen?',
      ['Sauerstoff', 'Stickstoff', 'Kohlendioxid', 'Wasser'],
      'Ohne Sauerstoff geht ein Feuer aus. Auf eurem Planeten ohne Luft brennt nichts.',
    ],
    [
      'What does a fire need to burn?',
      ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Water'],
      'Without oxygen a fire goes out. On your planet without air nothing burns.',
    ],
  ),
];
