import { expect, test } from '@playwright/test';

test.use({ locale: 'en-US' });

test('language: English browser gets English, the switch changes to German', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.m-item', { hasText: 'New game' })).toBeVisible();
  await expect(page.locator('h1.title')).toHaveText('Crashlanded');
  await page.locator('.lang-switch [data-lang="de"]').click();
  await expect(page.locator('.m-item', { hasText: 'Neues Spiel' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await page.locator('.m-item', { hasText: 'Neues Spiel' }).click();
  await expect(page.locator('.faction-card.human')).toContainText('Menschen');
});
