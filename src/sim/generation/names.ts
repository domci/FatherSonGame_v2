/** Name parts for random planets. */
const START = ['Ka', 'Ve', 'Or', 'Zu', 'Tal', 'Mi', 'Ner', 'Sol', 'Ax', 'Ry', 'Lo', 'Gan'];
const END = ['ris', 'ton', 'xa', 'mar', 'del', 'nus', 'ka', 'phos', 'lun', 'tera', 'vos', 'dor'];

export function planetName(pick: <T>(items: readonly T[]) => T): string {
  return pick(START) + pick(END);
}
