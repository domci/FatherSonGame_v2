import { expect, test, type Page } from '@playwright/test';

async function startNewGame(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  await page.goto('/');
  await page.getByRole('button', { name: /Neues Spiel/ }).click();
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

test('the game saves and can continue', async ({ page }) => {
  await startNewGame(page);
  await page.getByTitle('Menü').click();
  await page.getByRole('button', { name: /Zum Hauptmenü/ }).click();
  await expect(page.getByRole('button', { name: /Weiterspielen/ })).toBeVisible();
  await page.getByRole('button', { name: /Weiterspielen/ }).click();
  // The HUD appears after the loading screen (renderer + 3D models).
  await expect(page.locator('.hud')).toBeVisible({ timeout: 60_000 });
});
