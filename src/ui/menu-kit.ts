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
