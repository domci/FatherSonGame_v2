import { expect, test, type Browser, type Page } from '@playwright/test';

/** The local world server (wrangler dev, see playwright.config.ts). */
test.use({ baseURL: 'http://localhost:8788' });

interface Online {
  gameDebug: {
    session: {
      me: string;
      state: { players: Record<string, { name: string; here?: boolean }> };
      net: { world: { code: string } };
    };
  };
}

async function online(browser: Browser, errors: string[]): Promise<Page> {
  // Small windows: two 3D games in software rendering are slow in CI.
  const ctx = await browser.newContext({ viewport: { width: 900, height: 600 } });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await page.getByRole('button', { name: /Online spielen/ }).click();
  await page.locator('.name-pick').first().click();
  await expect(page.getByText(/Hallo, /)).toBeVisible();
  return page;
}

test('online: make a world, a friend joins with the code, chat', async ({ browser }) => {
  test.setTimeout(300_000);
  const errors: string[] = [];
  const a = await online(browser, errors);
  await a.getByRole('button', { name: /Neue Welt/ }).click();
  await a.getByRole('button', { name: /Welt bauen/ }).click();
  await expect(a.locator('.hud')).toBeVisible({ timeout: 90_000 });
  const code = await a.evaluate(
    () => (window as unknown as Online).gameDebug.session.net.world.code,
  );

  const b = await online(browser, errors);
  await b.locator('.code-input').fill(code);
  await b.getByRole('button', { name: /Mit Code beitreten/ }).click();
  await b.locator('[data-faction=alien]').click();
  await b.getByRole('button', { name: /^Beitreten$/ }).click();
  await expect(b.locator('.hud')).toBeVisible({ timeout: 90_000 });

  // Both browsers replay the same world: A sees B's seat and that B is there.
  const players = (p: Page): Promise<string> =>
    p.evaluate(() => {
      const s = (window as unknown as Online).gameDebug.session;
      return Object.values(s.state.players)
        .filter((x) => x.here)
        .map((x) => x.name)
        .sort()
        .join(',');
    });
  await expect.poll(() => players(a), { timeout: 30_000 }).toContain(',');
  expect(await players(a)).toBe(await players(b));

  await b.locator('.chat-btn').click();
  await b.locator('.chat-input').fill('Hallo, ich bin neu hier');
  await b.locator('.chat-input').press('Enter');
  await a.locator('.chat-btn').click();
  await expect(a.locator('.chat-line')).toContainText('Hallo, ich bin neu hier', {
    timeout: 30_000,
  });

  // A rude line never reaches A; B gets a warning.
  await b.waitForTimeout(2500);
  await b.locator('.chat-input').fill('du idiot');
  await b.locator('.chat-input').press('Enter');
  await expect(b.locator('.toast').first()).toContainText(/Verwarnung|freundlich/, {
    timeout: 30_000,
  });
  await expect(a.locator('.chat-line')).toHaveCount(1);
  expect(errors).toEqual([]);
});
