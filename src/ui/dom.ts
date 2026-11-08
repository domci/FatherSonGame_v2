type Child = HTMLElement | string | null | undefined | false;

/** Small helper to create HTML elements: el('button', { class: 'x', onclick }, 'Text'). */
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Partial<Record<string, string | ((e: Event) => void) | boolean>> = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (typeof value === 'function') node.addEventListener(key.replace(/^on/, ''), value);
    else if (value === true) node.setAttribute(key, '');
    else if (typeof value === 'string') node.setAttribute(key, value);
  }
  for (const child of children) if (child) node.append(child);
  return node;
}

export function clear(node: HTMLElement): void {
  node.replaceChildren();
}

export function formatNumber(n: number): string {
  if (n >= 10000) return `${Math.floor(n / 1000)}k`;
  return Math.floor(n).toString();
}

/** "2 Std 5 Min", "45 Sek" */
export function formatDuration(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d} T ${h} Std`;
  if (h > 0) return `${h} Std ${m} Min`;
  if (m > 0) return `${m} Min ${s % 60} Sek`;
  return `${s} Sek`;
}
