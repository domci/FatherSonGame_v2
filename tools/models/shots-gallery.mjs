// Saves a picture of the model gallery. Needs `bun run dev` on port 5173.
// Usage: node tools/models/shots-gallery.mjs out.png [main|units|ships|human|alien]
import { chromium } from '@playwright/test';

const out = process.argv[2] ?? 'gallery.png';
const set = process.argv[3] ?? 'main';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
page.on('pageerror', (e) => console.error(e.message));
await page.goto(`http://localhost:5173/tools/gallery.html?set=${set}`);
await page.waitForLoadState('networkidle');
await page.waitForFunction(() => window.galleryReady, null, { timeout: 180000 });
await page.evaluate(() => window.galleryReady);
await page.locator('#c').screenshot({ path: out });
console.info(`saved ${out}`);
await browser.close();
