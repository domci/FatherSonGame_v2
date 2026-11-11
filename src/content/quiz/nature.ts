import { q, type QuizQuestion } from './types';

/** Natur. The first answer is always the right one. */
export const NATURE: readonly QuizQuestion[] = [
  q(
    'nature',
    'plants',
    'Was brauchen Pflanzen zum Wachsen?',
    ['Licht, Wasser und Luft', 'Nur Erde', 'Nur Wasser', 'Dunkelheit und Wärme'],
    'Aus Licht, Wasser und Kohlendioxid aus der Luft machen Pflanzen Zucker und Sauerstoff.',
  ),
  q(
    'nature',
    'breathe',
    'Welches Gas brauchen wir zum Atmen?',
    ['Sauerstoff', 'Kohlendioxid', 'Helium', 'Wasserstoff'],
    'Wir atmen Sauerstoff ein und Kohlendioxid aus. Darum brauchen eure Bewohner Sauerstoff.',
  ),
  q(
    'nature',
    'spider-legs',
    'Wie viele Beine hat eine Spinne?',
    ['8', '6', '10', '4'],
    'Spinnen haben 8 Beine. Sie sind keine Insekten.',
  ),
  q(
    'nature',
    'insect-legs',
    'Wie viele Beine hat ein Insekt?',
    ['6', '8', '4', '10'],
    'Alle Insekten haben 6 Beine, zum Beispiel Bienen, Käfer und Ameisen.',
  ),
  q(
    'nature',
    'mammal',
    'Welches Tier ist ein Säugetier?',
    ['Wal', 'Hai', 'Pinguin', 'Krokodil'],
    'Wale atmen Luft und füttern ihre Jungen mit Milch. Der Hai ist ein Fisch.',
  ),
  q(
    'nature',
    'skin',
    'Was ist das größte Organ des Menschen?',
    ['Die Haut', 'Das Herz', 'Die Leber', 'Das Gehirn'],
    'Die Haut eines Erwachsenen ist fast 2 Quadratmeter groß.',
  ),
  q(
    'nature',
    'bones',
    'Wie viele Knochen hat ein erwachsener Mensch ungefähr?',
    ['206', '50', '106', '520'],
    'Babys haben mehr Knochen. Manche wachsen später zusammen.',
  ),
  q(
    'nature',
    'biggest-animal',
    'Welches ist das größte Tier der Welt?',
    ['Blauwal', 'Afrikanischer Elefant', 'Giraffe', 'Weißer Hai'],
    'Ein Blauwal kann bis zu 30 Meter lang werden.',
  ),
  q(
    'nature',
    'clouds',
    'Woraus bestehen Wolken?',
    ['Aus winzigen Wassertropfen oder Eis', 'Aus Rauch', 'Aus Watte', 'Aus Sand'],
    'Warme Luft steigt auf und kühlt ab. Der Wasserdampf wird zu winzigen Tropfen.',
  ),
  q(
    'nature',
    'honey',
    'Was machen Bienen aus dem Nektar der Blüten?',
    ['Honig', 'Milch', 'Seide', 'Wachs aus Holz'],
    'Bienen sammeln den süßen Nektar und machen daraus im Stock Honig.',
  ),
  q(
    'nature',
    'fish',
    'Womit atmen Fische?',
    ['Mit Kiemen', 'Mit Lungen', 'Mit der Nase', 'Sie atmen gar nicht'],
    'Die Kiemen holen den Sauerstoff aus dem Wasser.',
  ),
  q(
    'nature',
    'heart',
    'Was pumpt das Blut durch unseren Körper?',
    ['Das Herz', 'Die Lunge', 'Der Magen', 'Die Nieren'],
    'Das Herz schlägt etwa 100 000 Mal am Tag.',
  ),
];
