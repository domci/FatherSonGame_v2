import { expect, test } from '@playwright/test';

test.use({ locale: 'de-DE' });

test('start screen links privacy page and legal notice; link preview for X', async ({ page }) => {
  await page.goto('/');
  const imprint = page.locator('.legal-links a', { hasText: 'Impressum' });
  await expect(imprint).toHaveAttribute('href', 'https://dom-builds.com/impressum');
  await page.locator('.legal-links a', { hasText: 'Datenschutz' }).click();
  await expect(page.locator('.info-page')).toContainText('Rechtliches (DSGVO)');
  await expect(page.locator('.info-page')).toContainText('nur fertige Schnell-Nachrichten');
  const og = page.locator('meta[property="og:image"]');
  await expect(og).toHaveAttribute('content', 'https://crashlanded.dom-builds.com/og.jpg');
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    'content',
    'summary_large_image',
  );
  const img = await page.request.get('/og.jpg');
  expect(img.headers()['content-type']).toContain('image/jpeg');
});
