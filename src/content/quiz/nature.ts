import { q, type QuizQuestion } from './types';

/** Natur. The first answer is always the right one. German first, then English. */
export const NATURE: readonly QuizQuestion[] = [
  q(
    'nature',
    'plants',
    [
      'Was brauchen Pflanzen zum Wachsen?',
      ['Licht, Wasser und Luft', 'Nur Erde', 'Nur Wasser', 'Dunkelheit und Wärme'],
      'Aus Licht, Wasser und Kohlendioxid aus der Luft machen Pflanzen Zucker und Sauerstoff.',
    ],
    [
      'What do plants need to grow?',
      ['Light, water and air', 'Only soil', 'Only water', 'Darkness and warmth'],
      'From light, water and carbon dioxide from the air, plants make sugar and oxygen.',
    ],
  ),
  q(
    'nature',
    'breathe',
    [
      'Welches Gas brauchen wir zum Atmen?',
      ['Sauerstoff', 'Kohlendioxid', 'Helium', 'Wasserstoff'],
      'Wir atmen Sauerstoff ein und Kohlendioxid aus. Darum brauchen eure Bewohner Sauerstoff.',
    ],
    [
      'Which gas do we need to breathe?',
      ['Oxygen', 'Carbon dioxide', 'Helium', 'Hydrogen'],
      'We breathe in oxygen and breathe out carbon dioxide. That is why your residents need oxygen.',
    ],
  ),
  q(
    'nature',
    'spider-legs',
    [
      'Wie viele Beine hat eine Spinne?',
      ['8', '6', '10', '4'],
      'Spinnen haben 8 Beine. Sie sind keine Insekten.',
    ],
    [
      'How many legs does a spider have?',
      ['8', '6', '10', '4'],
      'Spiders have 8 legs. They are not insects.',
    ],
  ),
  q(
    'nature',
    'insect-legs',
    [
      'Wie viele Beine hat ein Insekt?',
      ['6', '8', '4', '10'],
      'Alle Insekten haben 6 Beine, zum Beispiel Bienen, Käfer und Ameisen.',
    ],
    [
      'How many legs does an insect have?',
      ['6', '8', '4', '10'],
      'All insects have 6 legs, for example bees, beetles and ants.',
    ],
  ),
  q(
    'nature',
    'mammal',
    [
      'Welches Tier ist ein Säugetier?',
      ['Wal', 'Hai', 'Pinguin', 'Krokodil'],
      'Wale atmen Luft und füttern ihre Jungen mit Milch. Der Hai ist ein Fisch.',
    ],
    [
      'Which animal is a mammal?',
      ['Whale', 'Shark', 'Penguin', 'Crocodile'],
      'Whales breathe air and feed their young with milk. The shark is a fish.',
    ],
  ),
  q(
    'nature',
    'skin',
    [
      'Was ist das größte Organ des Menschen?',
      ['Die Haut', 'Das Herz', 'Die Leber', 'Das Gehirn'],
      'Die Haut eines Erwachsenen ist fast 2 Quadratmeter groß.',
    ],
    [
      'What is the biggest organ of the human body?',
      ['The skin', 'The heart', 'The liver', 'The brain'],
      'The skin of an adult is almost 2 square meters big.',
    ],
  ),
  q(
    'nature',
    'bones',
    [
      'Wie viele Knochen hat ein erwachsener Mensch ungefähr?',
      ['206', '50', '106', '520'],
      'Babys haben mehr Knochen. Manche wachsen später zusammen.',
    ],
    [
      'About how many bones does an adult human have?',
      ['206', '50', '106', '520'],
      'Babies have more bones. Some grow together later.',
    ],
  ),
  q(
    'nature',
    'biggest-animal',
    [
      'Welches ist das größte Tier der Welt?',
      ['Blauwal', 'Afrikanischer Elefant', 'Giraffe', 'Weißer Hai'],
      'Ein Blauwal kann bis zu 30 Meter lang werden.',
    ],
    [
      'Which is the biggest animal in the world?',
      ['Blue whale', 'African elephant', 'Giraffe', 'Great white shark'],
      'A blue whale can be up to 30 meters long.',
    ],
  ),
  q(
    'nature',
    'clouds',
    [
      'Woraus bestehen Wolken?',
      ['Aus winzigen Wassertropfen oder Eis', 'Aus Rauch', 'Aus Watte', 'Aus Sand'],
      'Warme Luft steigt auf und kühlt ab. Der Wasserdampf wird zu winzigen Tropfen.',
    ],
    [
      'What are clouds made of?',
      ['Tiny drops of water or ice', 'Smoke', 'Cotton wool', 'Sand'],
      'Warm air rises and cools down. The water vapor turns into tiny drops.',
    ],
  ),
  q(
    'nature',
    'honey',
    [
      'Was machen Bienen aus dem Nektar der Blüten?',
      ['Honig', 'Milch', 'Seide', 'Wachs aus Holz'],
      'Bienen sammeln den süßen Nektar und machen daraus im Stock Honig.',
    ],
    [
      'What do bees make from the nectar of flowers?',
      ['Honey', 'Milk', 'Silk', 'Wax from wood'],
      'Bees collect the sweet nectar and make honey from it in the hive.',
    ],
  ),
  q(
    'nature',
    'fish',
    [
      'Womit atmen Fische?',
      ['Mit Kiemen', 'Mit Lungen', 'Mit der Nase', 'Sie atmen gar nicht'],
      'Die Kiemen holen den Sauerstoff aus dem Wasser.',
    ],
    [
      'What do fish breathe with?',
      ['With gills', 'With lungs', 'With their nose', 'They do not breathe at all'],
      'The gills take the oxygen out of the water.',
    ],
  ),
  q(
    'nature',
    'heart',
    [
      'Was pumpt das Blut durch unseren Körper?',
      ['Das Herz', 'Die Lunge', 'Der Magen', 'Die Nieren'],
      'Das Herz schlägt etwa 100 000 Mal am Tag.',
    ],
    [
      'What pumps the blood through our body?',
      ['The heart', 'The lungs', 'The stomach', 'The kidneys'],
      'The heart beats about 100,000 times a day.',
    ],
  ),
];
