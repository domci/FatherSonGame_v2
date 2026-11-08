// Saves building pictures to public/ui/thumbs. Needs `bun run dev` on port 5173.
// Usage: node tools/make-thumbs.mjs
import { writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('http://localhost:5173/tools/thumbs.html');
await page.waitForLoadState('networkidle');
await page.waitForFunction(() => window.thumbs, null, { timeout: 120000 });
const thumbs = await page.evaluate(() => window.thumbs);
for (const [id, url] of Object.entries(thumbs)) {
  writeFileSync(`public/ui/thumbs/${id}.png`, Buffer.from(url.split(',')[1], 'base64'));
}
console.info(`saved ${Object.keys(thumbs).length} pictures`);
await browser.close();
