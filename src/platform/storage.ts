import { get, set, del } from 'idb-keyval';
import type { SaveData } from '../sim/save/save';
import { L, LocError } from '../content/text';

const KEY = 'fathersongame-v2-slot1';

export async function loadSave(): Promise<unknown> {
  try {
    return await get(KEY);
  } catch (e) {
    console.warn('Could not read save', e);
    return undefined;
  }
}

export async function writeSave(data: SaveData): Promise<void> {
  await set(KEY, data);
}

export async function deleteSave(): Promise<void> {
  await del(KEY);
}

/** Lets the player download the save as a file. */
export function exportSave(data: SaveData): void {
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `crashlanded-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

/** Opens a file picker and reads a save file. */
export function importSaveFile(): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return reject(new LocError(L('Keine Datei.', 'No file.')));
      try {
        resolve(JSON.parse(await file.text()));
      } catch {
        reject(new LocError(L('Datei ist kein Spielstand.', 'The file is not a saved game.')));
      }
    };
    input.click();
  });
}
