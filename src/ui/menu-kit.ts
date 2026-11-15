import { DIFFICULTY_HELP, DIFFICULTY_NAMES, type Difficulty } from '../content/ai';
import { el } from './dom';
import { t, tx } from '../i18n';

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

/** A row of buttons; one is on. Shows the help line of the chosen one. */
export function segRow<T extends string | number>(
  label: string,
  options: readonly { value: T; text: string; help: string }[],
  current: T,
  onPick: (v: T) => void,
): HTMLElement {
  const helpOf = (v: T): string => options.find((o) => o.value === v)?.help ?? '';
  const help = el('span', { class: 'tr-help' }, helpOf(current));
  const buttons = options.map((o) =>
    el(
      'button',
      {
        class: o.value === current ? 'seg-btn on' : 'seg-btn',
        'data-value': String(o.value),
        onclick: () => {
          buttons.forEach((b) => b.classList.toggle('on', b.dataset.value === String(o.value)));
          help.textContent = o.help;
          onPick(o.value);
        },
      },
      o.text,
    ),
  );
  return el(
    'div',
    { class: 'toggle-row level-row' },
    el('span', { class: 'tr-text' }, el('span', { class: 'tr-label' }, label), help),
    el('div', { class: 'panel seg' }, ...buttons),
  );
}

const OPPONENT_HELP = [t('opp1'), t('opp2'), t('opp3')];

/** How many computer peoples: 1, 2 or 3. */
export function opponentPicker(current: number, onPick: (n: number) => void): HTMLElement {
  const options = OPPONENT_HELP.map((help, i) => ({ value: i + 1, text: String(i + 1), help }));
  return segRow(t('oppCount'), options, current, onPick);
}

/** Leicht / Mittel / Schwer with one help line for the chosen level. */
export function levelPicker(current: Difficulty, onPick: (d: Difficulty) => void): HTMLElement {
  const options = (Object.keys(DIFFICULTY_NAMES) as Difficulty[]).map((d) => ({
    value: d,
    text: tx(DIFFICULTY_NAMES[d]),
    help: tx(DIFFICULTY_HELP[d]),
  }));
  return segRow(t('oppLevel'), options, current, onPick);
}
