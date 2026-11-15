import { el } from './dom';
import { button } from './online-menu';

/** The address of the page with the world code: opening it joins the world (M7, ADR 0010). */
export function worldLink(code: string, origin = location.origin): string {
  return `${origin}/#welt=${code}`;
}

/** The world code in an address (`#welt=ABC123`), if there is one. */
export function codeInHash(hash: string): string | undefined {
  return /^#welt=([0-9A-Za-z]{6})$/.exec(hash)?.[1]?.toUpperCase();
}

async function copy(text: string, field: HTMLInputElement, note: HTMLElement): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    note.textContent = 'Kopiert! Schick den Link jetzt deinen Freunden.';
  } catch {
    field.select();
    note.textContent = 'Markiert. Kopiere den Link mit Strg+C (oder lange tippen).';
  }
}

/** Link, copy button, share button (phones and tablets) and a safety hint for kids. */
export function shareBox(world: { name: string; code: string }): (HTMLElement | false)[] {
  const link = worldLink(world.code);
  const field = el('input', { class: 'code-input share-link', readonly: 'true', value: link });
  field.addEventListener('focus', () => field.select());
  const note = el('p', { class: 'p-text muted' }, `Welt-Code: ${world.code}`);
  const share = (): void =>
    void navigator
      .share({ title: world.name, text: `Komm in meine Welt „${world.name}“!`, url: link })
      .catch(() => undefined);
  return [
    el(
      'p',
      { class: 'p-text' },
      'Wer diesen Link öffnet, kann eurer Welt beitreten. Ist sie voll, kommt ein neuer Planet dazu.',
    ),
    el(
      'div',
      { class: 'code-row' },
      field,
      button('copy', 'Kopieren', () => void copy(link, field, note)),
    ),
    'share' in navigator && button('send', 'Teilen …', share, 'small'),
    note,
    el(
      'p',
      { class: 'p-text muted' },
      'Gib den Link nur Leuten, die du kennst. Neue Spieler haben 3 Tage Schutz.',
    ),
  ];
}

/** "Freunde einladen" in the game: over the game, closes with "Fertig". */
export function shareModal(
  world: { name: string; code: string },
  onClose: () => void,
): HTMLElement {
  return el(
    'div',
    { class: 'screen modal' },
    el(
      'div',
      { class: 'panel dialog' },
      el('div', { class: 'p-sub' }, world.name),
      el('h2', {}, 'Freunde einladen'),
      ...shareBox(world),
      el('div', { class: 'dlg-buttons' }, button('check', 'Fertig', onClose, 'primary')),
    ),
  );
}
