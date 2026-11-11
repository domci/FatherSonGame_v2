import { expect, test } from '@playwright/test';
import { startNewGame } from './helpers';

interface Game {
  gameDebug: {
    session: {
      state: {
        players: {
          player: {
            resources: Record<string, number>;
            quiz: { current?: { order: number[] } };
          };
        };
      };
    };
  };
}

test('colony window, first mission and knowledge quiz', async ({ page }) => {
  const errors = await startNewGame(page);
  await expect(page.locator('.mission-card')).toContainText('Solarfeld');

  await page.getByTitle(/Bewohner und Laune/).click();
  await expect(page.locator('.info-panel')).toContainText('Eure Kolonie');
  await expect(page.locator('.info-panel')).toContainText('Darum ist die Laune so');

  await page.getByTitle('Wissens-Quiz').click();
  await expect(page.locator('.quiz-q')).toBeVisible();
  const right = await page.evaluate(
    () =>
      (
        window as unknown as Game
      ).gameDebug.session.state.players.player.quiz.current?.order.indexOf(0) ?? -1,
  );
  await page.locator('.quiz-answer').nth(right).click();
  await expect(page.locator('.quiz-result')).toContainText('Richtig');
  const crystals = await page.evaluate(
    () => (window as unknown as Game).gameDebug.session.state.players.player.resources.crystals,
  );
  expect(crystals).toBe(1);
  await page.getByRole('button', { name: /Weiter/ }).click();
  await expect(page.locator('.quiz-screen')).toHaveCount(0);
  expect(errors).toEqual([]);
});
