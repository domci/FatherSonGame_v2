// Takes two in-game pictures (human and alien base, with spiders and a ship). Needs a running dev server.
// Usage: node tools/models/shots-ingame.mjs http://localhost:5173/ /tmp/after   (writes /tmp/after-human.png, -alien.png)
import { chromium } from '@playwright/test';
const [base, out] = process.argv.slice(2);
const browser = await chromium.launch();
async function shot(faction) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, locale: 'de-DE' });
  page.on('pageerror', (e) => console.error('ERR', e.message));
  await page.goto(base);
  await page.getByRole('button', { name: /Neues Spiel/ }).click();
  await page.locator(`[data-faction=${faction}]`).click();
  await page.getByRole('button', { name: /Los geht/ }).click();
  await page.locator('.hud').waitFor({ timeout: 120000 });
  await page.getByRole('button', { name: /Zur Basis/ }).click();
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    const d = window.gameDebug;
    const s = d.session.state;
    const zone = s.system.homeBodyId;
    const c = (s.surfaces[zone]?.size ?? 64) / 2;
    d.spawnBuilding(s, 'player', zone, { type: 'habitatDome', tileX: c - 6, tileY: c + 1, level: 1 });
    d.spawnBuilding(s, 'player', zone, { type: 'lab', tileX: c + 4, tileY: c + 2, level: 1 });
    for (let i = 0; i < 2; i++) d.spawnUnit(s, 'wild', zone, 'spider', { x: c - 2 + i * 1.6, y: c + 5.5 });
    d.spawnUnit(s, 'player', zone, 'transport', { x: c + 1, y: c + 4 });
  });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${out}-${faction}.png` });
  await page.close();
}
await shot('human');
await shot('alien');
await browser.close();
console.info('done');
