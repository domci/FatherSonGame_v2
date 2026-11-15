import { expect, test, type Browser, type Page } from '@playwright/test';

interface Online {
  gameDebug: { session: { net: { world: { code: string } } } };
}

async function player(
  browser: Browser,
  locale: string,
  errors: string[],
  path = '/',
): Promise<Page> {
  const ctx = await browser.newContext({ locale, viewport: { width: 900, height: 600 } });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(path);
  return page;
}

test('live: menu in both languages, privacy and parents page', async ({ browser }) => {
  const errors: string[] = [];
  const en = await player(browser, 'en-US', errors);
  await expect(en.getByRole('button', { name: /New game/ })).toBeVisible();
  await expect(en).toHaveTitle(/Crashlanded/);
  await en.locator('[data-lang=de]').click();
  await expect(en.getByRole('button', { name: /Neues Spiel/ })).toBeVisible();
  const de = await player(browser, 'de-DE', errors, '/#datenschutz');
  await expect(de.getByText(/Datenschutz/).first()).toBeVisible();
  const parents = await player(browser, 'de-DE', errors, '/#eltern');
  await expect(parents.locator('input[type=password]')).toBeVisible();
  await parents.screenshot({ path: 'test-results/live-parents.png' });
  expect(errors).toEqual([]);
});

test('live: German makes a world, English friend joins by link, chat', async ({ browser }) => {
  const errors: string[] = [];
  const a = await player(browser, 'de-DE', errors);
  await a.getByRole('button', { name: /Online spielen/ }).click();
  await a.locator('.name-pick').first().click();
  await a.getByRole('button', { name: /Neue Welt/ }).click();
  await a.getByRole('button', { name: /Welt bauen/ }).click();
  await expect(a.locator('.hud')).toBeVisible({ timeout: 120_000 });
  const code = await a.evaluate(
    () => (window as unknown as Online).gameDebug.session.net.world.code,
  );

  const b = await player(browser, 'en-US', errors, `/#welt=${code}`);
  await b.locator('.name-pick').first().click();
  await b.locator('[data-faction=alien]').click();
  await b.getByRole('button', { name: /^Join$/ }).click();
  await expect(b.locator('.hud')).toBeVisible({ timeout: 120_000 });

  // Quick message: each reader sees it in their own language.
  await b.locator('.chat-btn').click();
  await b.locator('.chat-quick .chip').first().click();
  await a.locator('.chat-btn').click();
  await expect(a.locator('.chat-line')).toHaveCount(1, { timeout: 30_000 });
  const quickDe = await a.locator('.chat-text').first().textContent();
  const quickEn = await b.locator('.chat-text').first().textContent();
  expect(quickDe).not.toBe(quickEn);

  await b.waitForTimeout(2500);
  await b.locator('.chat-input').fill('Hello, I am new here');
  await b.locator('.chat-input').press('Enter');
  await expect(a.locator('.chat-line')).toHaveCount(2, { timeout: 30_000 });

  // Rule block (word list) and the warning in English.
  await b.waitForTimeout(2500);
  await b.locator('.chat-input').fill('du idiot');
  await b.locator('.chat-input').press('Enter');
  await expect(b.locator('.toast').first()).toBeVisible({ timeout: 30_000 });
  const warn = await b.locator('.toast').first().textContent();
  await b.screenshot({ path: 'test-results/live-chat-en.png' });
  await a.screenshot({ path: 'test-results/live-chat-de.png' });
  await expect(a.locator('.chat-line')).toHaveCount(2);

  // Llama Guard: no bad word, but a threat. It must not reach A.
  await b.waitForTimeout(2500);
  await b.locator('.chat-input').fill('I know where your school is and I will come and hurt you');
  await b.locator('.chat-input').press('Enter');
  await b.waitForTimeout(8000);
  await expect(a.locator('.chat-line')).toHaveCount(2);
  console.info(JSON.stringify({ code, quickDe, quickEn, warn }));
  expect(errors).toEqual([]);
});

interface Quiz {
  gameDebug: {
    session: {
      state: {
        players: {
          player: { quiz: { current?: { order: number[] } }; resources: { crystals?: number } };
        };
      };
    };
  };
}

test('live: English game, story, build a solar field, quiz', async ({ browser }) => {
  const errors: string[] = [];
  const p = await player(browser, 'en-US', errors);
  await p.getByRole('button', { name: /New game/ }).click();
  await p.locator('[data-faction=human]').click();
  await p.getByRole('button', { name: /Let's go/ }).click();
  await expect(p.locator('.hud')).toBeVisible({ timeout: 120_000 });
  await p.screenshot({ path: 'test-results/live-story-en.png' });
  await p.getByRole('button', { name: /To the base/ }).click();
  await p.waitForTimeout(2500);
  await expect(p.locator('.mission-card')).toContainText('Solar Field');
  const before = await p.locator('.res').first().textContent();
  await p.getByRole('button', { name: /Solar Field/ }).click();
  const box = await p.locator('canvas').boundingBox();
  if (!box) throw new Error('no canvas');
  await p.mouse.move(box.x + box.width * 0.35, box.y + box.height * 0.6);
  await p.mouse.click(box.x + box.width * 0.35, box.y + box.height * 0.6);
  await expect(p.locator('.res').first()).not.toHaveText(before ?? '');
  await p.getByTitle('Knowledge quiz').click();
  await expect(p.locator('.quiz-q')).toBeVisible();
  const right = await p.evaluate(
    () =>
      (
        window as unknown as Quiz
      ).gameDebug.session.state.players.player.quiz.current?.order.indexOf(0) ?? -1,
  );
  await p.screenshot({ path: 'test-results/live-quiz-en.png' });
  await p.locator('.quiz-answer').nth(right).click();
  await expect(p.locator('.quiz-result')).toContainText('Right');
  expect(errors).toEqual([]);
});
