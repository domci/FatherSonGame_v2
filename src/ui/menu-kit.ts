import { DIFFICULTY_HELP, DIFFICULTY_NAMES, type Difficulty } from '../content/ai';
import { el } from './dom';

/** A row with a label, a small help text and an on/off switch. */
export function toggleRow(
  label: string,
  help: string,
  on: boolean,
  onChange: (on: boolean) => void,
): HTMLElement {
  const input = el('input', { type: 'checkbox', class: 'switch' });
  input.checked = on;
  input.addEventListener('change', () => onChange(input.checked));
  return el(
    'label',
    { class: 'toggle-row' },
    el(
      'span',
      { class: 'tr-text' },
      el('span', { class: 'tr-label' }, label),
      el('span', { class: 'tr-help' }, help),
    ),
    input,
  );
}

/** Leicht / Mittel / Schwer with one help line for the chosen level. */
export function levelPicker(current: Difficulty, onPick: (d: Difficulty) => void): HTMLElement {
  const help = el('span', { class: 'tr-help' }, DIFFICULTY_HELP[current]);
  const levels = (Object.keys(DIFFICULTY_NAMES) as Difficulty[]).map((d) =>
    el(
      'button',
      {
        class: d === current ? 'seg-btn on' : 'seg-btn',
        'data-level': d,
        onclick: () => {
          levels.forEach((b) => b.classList.toggle('on', b.dataset.level === d));
          help.textContent = DIFFICULTY_HELP[d];
          onPick(d);
        },
      },
      DIFFICULTY_NAMES[d],
    ),
  );
  return el(
    'div',
    { class: 'toggle-row level-row' },
    el('span', { class: 'tr-text' }, el('span', { class: 'tr-label' }, 'Stärke des Gegners'), help),
    el('div', { class: 'panel seg' }, ...levels),
  );
}
