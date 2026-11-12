import { expect, test } from '@playwright/test';
import { startNewGame } from './helpers';

interface Game {
  gameDebug: {
    session: {
      state: {
        time: number;
        events: { text: string }[];
        players: Record<string, { name: string } | undefined>;
        system: { homes: string[] };
      };
    };
  };
}

test('three computer peoples and the peoples window: peace', async ({ page }) => {
  test.setTimeout(180_000);
  const errors = await startNewGame(page, 'human', 3);
  const info = await page.evaluate(() => {
    const s = (window as unknown as Game).gameDebug.session.state;
    return { sides: Object.keys(s.players).length, homes: s.system.homes.length };
  });
  expect(info).toEqual({ sides: 4, homes: 4 });

  await page.getByTitle(/Völker/).click();
  const cards = page.locator('.side-card');
  await expect(cards).toHaveCount(3);
  await expect(cards.first()).toContainText('Krieg');

  // Peace is possible after 5 minutes of war.
  await page.evaluate(() => {
    (window as unknown as Game).gameDebug.session.state.time = 6 * 60_000;
  });
  await cards
    .first()
    .getByRole('button', { name: /Frieden anbieten/ })
    .click();
  // The toast can be gone already on a slow machine: check the game's message list instead.
  await expect
    .poll(() =>
      page.evaluate(() =>
        (window as unknown as Game).gameDebug.session.state.events.some((e) =>
          e.text.startsWith('Frieden mit'),
        ),
      ),
    )
    .toBe(true);
  await expect(cards.first().locator('.side-rel')).toHaveText('Frieden');
  await expect(cards.first().getByRole('button', { name: /Bündnis anbieten/ })).toBeVisible();
  expect(errors).toEqual([]);
});
