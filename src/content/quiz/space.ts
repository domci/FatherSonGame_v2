import { q, type QuizQuestion } from './types';

/** Weltraum. The first answer is always the right one. German first, then English. */
export const SPACE: readonly QuizQuestion[] = [
  q(
    'space',
    'nearest',
    [
      'Welcher Planet ist der Sonne am nächsten?',
      ['Merkur', 'Venus', 'Mars', 'Erde'],
      'Merkur braucht nur 88 Tage für eine Runde um die Sonne.',
    ],
    [
      'Which planet is closest to the Sun?',
      ['Mercury', 'Venus', 'Mars', 'Earth'],
      'Mercury needs only 88 days for one trip around the Sun.',
    ],
  ),
  q(
    'space',
    'biggest',
    [
      'Welcher ist der größte Planet in unserem Sonnensystem?',
      ['Jupiter', 'Saturn', 'Neptun', 'Erde'],
      'Jupiter ist so groß, dass mehr als 1000 Erden hineinpassen würden.',
    ],
    [
      'Which is the biggest planet in our solar system?',
      ['Jupiter', 'Saturn', 'Neptune', 'Earth'],
      'Jupiter is so big that more than 1000 Earths would fit inside.',
    ],
  ),
  q(
    'space',
    'light',
    [
      'Wie lange braucht das Licht von der Sonne bis zur Erde?',
      ['Etwa 8 Minuten', 'Etwa 8 Sekunden', 'Etwa 8 Stunden', 'Etwa 8 Tage'],
      'Das Licht fliegt fast 150 Millionen Kilometer weit. Das dauert etwa 8 Minuten.',
    ],
    [
      'How long does light take from the Sun to the Earth?',
      ['About 8 minutes', 'About 8 seconds', 'About 8 hours', 'About 8 days'],
      'The light flies almost 150 million kilometers. That takes about 8 minutes.',
    ],
  ),
  q(
    'space',
    'galaxy',
    [
      'Wie heißt unsere Galaxie?',
      ['Milchstraße', 'Andromeda', 'Sombrero-Galaxie', 'Große Magellansche Wolke'],
      'Die Milchstraße hat mehr als 100 Milliarden Sterne. Die Sonne ist einer davon.',
    ],
    [
      'What is the name of our galaxy?',
      ['Milky Way', 'Andromeda', 'Sombrero Galaxy', 'Large Magellanic Cloud'],
      'The Milky Way has more than 100 billion stars. The Sun is one of them.',
    ],
  ),
  q(
    'space',
    'moon-walk',
    [
      'Wer betrat 1969 als erster Mensch den Mond?',
      ['Neil Armstrong', 'Buzz Aldrin', 'Juri Gagarin', 'Michael Collins'],
      'Neil Armstrong flog mit Apollo 11. Buzz Aldrin folgte ihm kurz danach.',
    ],
    [
      'Who was the first person to walk on the Moon in 1969?',
      ['Neil Armstrong', 'Buzz Aldrin', 'Yuri Gagarin', 'Michael Collins'],
      'Neil Armstrong flew with Apollo 11. Buzz Aldrin followed him shortly after.',
    ],
  ),
  q(
    'space',
    'mars-red',
    [
      'Warum sieht der Mars rot aus?',
      ['Sein Staub enthält Rost', 'Er ist sehr heiß', 'Dort wachsen rote Pflanzen', 'Er glüht'],
      'Im Staub und Gestein ist viel Eisenoxid. Das ist dasselbe wie Rost.',
    ],
    [
      'Why does Mars look red?',
      ['Its dust contains rust', 'It is very hot', 'Red plants grow there', 'It glows'],
      'The dust and rock contain a lot of iron oxide. That is the same as rust.',
    ],
  ),
  q(
    'space',
    'rings',
    [
      'Welcher Planet hat die größten und hellsten Ringe?',
      ['Saturn', 'Mars', 'Merkur', 'Venus'],
      'Die Ringe sind aus Eis und Gestein. Jupiter, Uranus und Neptun haben auch Ringe, aber viel dünnere.',
    ],
    [
      'Which planet has the biggest and brightest rings?',
      ['Saturn', 'Mars', 'Mercury', 'Venus'],
      'The rings are made of ice and rock. Jupiter, Uranus and Neptune have rings too, but much thinner ones.',
    ],
  ),
  q(
    'space',
    'sun',
    [
      'Was ist die Sonne?',
      ['Ein Stern', 'Ein Planet', 'Ein Mond', 'Ein Komet'],
      'Die Sonne ist ein Stern. Andere Sterne sind nur viel weiter weg.',
    ],
    [
      'What is the Sun?',
      ['A star', 'A planet', 'A moon', 'A comet'],
      'The Sun is a star. Other stars are just much farther away.',
    ],
  ),
  q(
    'space',
    'planets',
    [
      'Wie viele Planeten hat unser Sonnensystem?',
      ['8', '9', '7', '10'],
      'Seit 2006 zählt Pluto nicht mehr als Planet, sondern als Zwergplanet.',
    ],
    [
      'How many planets does our solar system have?',
      ['8', '9', '7', '10'],
      'Since 2006 Pluto no longer counts as a planet, but as a dwarf planet.',
    ],
  ),
  q(
    'space',
    'hottest',
    [
      'Welcher Planet ist am heißesten?',
      ['Venus', 'Merkur', 'Mars', 'Jupiter'],
      'Die dicke Lufthülle der Venus hält die Wärme fest. Es ist dort über 460 °C heiß.',
    ],
    [
      'Which planet is the hottest?',
      ['Venus', 'Mercury', 'Mars', 'Jupiter'],
      'The thick air of Venus holds the heat. It is over 460 °C hot there.',
    ],
  ),
  q(
    'space',
    'moon-wind',
    [
      'Warum gibt es auf dem Mond keinen Wind?',
      [
        'Es gibt dort fast keine Luft',
        'Es ist dort immer Nacht',
        'Der Mond dreht sich nicht',
        'Die Erde hält den Wind fest',
      ],
      'Wind ist Luft, die sich bewegt. Ohne Luft gibt es keinen Wind.',
    ],
    [
      'Why is there no wind on the Moon?',
      [
        'There is almost no air there',
        'It is always night there',
        'The Moon does not turn',
        'The Earth holds the wind',
      ],
      'Wind is air that moves. Without air there is no wind.',
    ],
  ),
  q(
    'space',
    'light-year',
    [
      'Was ist ein Lichtjahr?',
      ['Eine Strecke', 'Eine Zeit', 'Eine Helligkeit', 'Ein Kalender'],
      'Ein Lichtjahr ist der Weg, den Licht in einem Jahr fliegt: etwa 9,5 Billionen Kilometer.',
    ],
    [
      'What is a light-year?',
      ['A distance', 'A time', 'A brightness', 'A calendar'],
      'A light-year is the distance light flies in one year: about 9.5 trillion kilometers.',
    ],
    12,
  ),
];
