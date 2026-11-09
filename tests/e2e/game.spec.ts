import { expect, test, type Page } from '@playwright/test';

interface Debug {
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

async function startNewGame(page: Page, faction: 'human' | 'alien' = 'human'): Promise<string[]> {
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

test('start a new game and see the base', async ({ page }, info) => {
  const errors = await startNewGame(page);
  await expect(page.locator('.build-bar')).toBeVisible();
  await page.screenshot({ path: `test-results/surface-${info.project.name}.png` });
  expect(errors).toEqual([]);
});

test('build a solar field', async ({ page }) => {
  await startNewGame(page);
  const before = await page.locator('.res').first().textContent();
  await page.getByRole('button', { name: /Solarfeld/ }).click();
  const box = await page.locator('canvas').boundingBox();
  if (!box) throw new Error('no canvas');
  const x = box.x + box.width * 0.35;
  const y = box.y + box.height * 0.6;
  await page.mouse.move(x, y);
  await page.mouse.click(x, y);
  await expect(page.locator('.res').first()).not.toHaveText(before ?? '');
});

test('switch to planet and solar system view', async ({ page }, info) => {
  const errors = await startNewGame(page);
  await page.getByRole('button', { name: /Planet/ }).click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `test-results/planet-${info.project.name}.png` });
  await page.getByRole('button', { name: /System/ }).click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `test-results/system-${info.project.name}.png` });
  expect(errors).toEqual([]);
});

test('zoom out with the wheel from the base to the solar system and back', async ({ page }) => {
  const errors = await startNewGame(page);
  const box = await page.locator('canvas').boundingBox();
  if (!box) throw new Error('no canvas');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  const on = page.locator('.hud .seg-btn.on');
  // Few big wheel steps: software rendering makes each frame slow.
  await page.mouse.wheel(0, 900);
  await expect(on).toContainText('Planet', { timeout: 30_000 });
  await page.mouse.wheel(0, 1500);
  await expect(on).toContainText('System', { timeout: 30_000 });
  // Back to the planet with the button (wheel-in over the system aims at the planet under the mouse).
  await page.getByRole('button', { name: /Planet/ }).click();
  await expect(on).toContainText('Planet', { timeout: 30_000 });
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.wheel(0, -1500);
  await expect(on).toContainText('Basis', { timeout: 30_000 });
  expect(errors).toEqual([]);
});

test('the game saves and can continue', async ({ page }) => {
  await startNewGame(page);
  await page.getByTitle('Menü').click();
  await page.getByRole('button', { name: /Zum Hauptmenü/ }).click();
  await expect(page.getByRole('button', { name: /Weiterspielen/ })).toBeVisible();
  await page.getByRole('button', { name: /Weiterspielen/ }).click();
  // The HUD appears after the loading screen (renderer + 3D models).
  await expect(page.locator('.hud')).toBeVisible({ timeout: 60_000 });
});

test('play as aliens: alien names in the build bar', async ({ page }) => {
  const errors = await startNewGame(page, 'alien');
  await expect(page.locator('.build-bar')).toContainText('Lichtsammler');
  await page.getByRole('button', { name: /Militär/ }).click();
  await expect(page.locator('.build-bar')).toContainText('Kriegerbrut');
  expect(errors).toEqual([]);
});

test('select troops with a box (Shift + drag)', async ({ page }) => {
  await startNewGame(page);
  const points = await page.evaluate(() => {
    const d = (window as unknown as Debug).gameDebug;
    const s = d.session.state as unknown as {
      system: { homeBodyId: string };
      surfaces: Record<string, { size: number }>;
    };
    const zone = s.system.homeBodyId;
    const c = (s.surfaces[zone]?.size ?? 64) / 2;
    const ids = [0, 1, 2].map(
      (i) => d.spawnUnit(s, 'player', zone, 'infantry', { x: c + 9 + i, y: c + 2 }).id,
    );
    return ids.map((id) => d.screenOfEntity(id));
  });
  const xs = points.map((p) => p?.x ?? 0);
  const ys = points.map((p) => p?.y ?? 0);
  await page.keyboard.down('Shift');
  await page.mouse.move(Math.min(...xs) - 40, Math.min(...ys) - 40);
  await page.mouse.down();
  await page.mouse.move(Math.max(...xs) + 40, Math.max(...ys) + 40, { steps: 6 });
  await page.mouse.up();
  await page.keyboard.up('Shift');
  await expect(page.locator('.info-panel')).toContainText('3 Einheiten');
});
