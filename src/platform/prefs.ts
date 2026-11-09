/** Small player preferences (sound on/off) in localStorage. Not part of the save. */
const PREFIX = 'bruchlandung:';

export function readPref(key: string, fallback: boolean): boolean {
  try {
    const v = localStorage.getItem(PREFIX + key);
    return v === null ? fallback : v === '1';
  } catch {
    return fallback;
  }
}

export function writePref(key: string, value: boolean): void {
  try {
    localStorage.setItem(PREFIX + key, value ? '1' : '0');
  } catch {
    // Private mode: the setting is only kept until the page closes.
  }
}
