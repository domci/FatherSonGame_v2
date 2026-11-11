import { expect, type Page } from '@playwright/test';

export interface Debug {
  gameDebug: {
    session: { state: { system: { homeBodyId: string } } };
    spawnUnit: (
      s: unknown,
      owner: string,
      zone: string,
      type: string,
      at: object,
    ) => { id: number };
    screenOfEntity: (id: number) => { x: number; y: number } | null;
  };
}

export async function startNewGame(
  page: Page,
  faction: 'human' | 'alien' = 'human',
): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  await page.goto('/');
  await page.getByRole('button', { name: /Neues Spiel/ }).click();
  await page.locator(`[data-faction=${faction}]`).click();
  await page.getByRole('button', { name: /Los geht/ }).click();
  // The HUD appears after the loading screen (renderer + 3D models).
  await expect(page.locator('.hud')).toBeVisible({ timeout: 60_000 });
  await page.waitForTimeout(2500);
  return errors;
}
