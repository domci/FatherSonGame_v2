import { expect, test } from '@playwright/test';
import { startNewGame } from './helpers';

interface Game {
  gameDebug: {
    session: {
      state: {
        system: { homeBodyId: string; bodies: { id: string }[] };
        surfaces: Record<string, { size: number }>;
        players: { player: { research: { done: string[] }; resources: Record<string, number> } };
        world: { with: (c: string) => { entities: { owner: string; orbit: { to?: string } }[] } };
      };
      ui: { selectedBodyId?: string };
      select: (ids: number[]) => void;
    };
    spawnBuilding: (s: unknown, owner: string, zone: string, b: object) => { id: number };
    spawnWarship: (s: unknown, owner: string, at: string, type: string) => { id: number };
  };
}

test('air and space: train a fighter, send the war fleet', async ({ page }) => {
  const errors = await startNewGame(page);
  await page.evaluate(() => {
    const d = (window as unknown as Game).gameDebug;
    const s = d.session.state;
    const me = s.players.player;
    me.research.done.push('lasers', 'spaceflight', 'aviation', 'warships');
    Object.assign(me.resources, { regolith: 2000, metal: 200, gas: 200, diamonds: 50 });
    const home = s.system.homeBodyId;
    const c = Math.floor((s.surfaces[home]?.size ?? 64) / 2);
    const at = { type: 'airfield', tileX: c - 10, tileY: c - 9, level: 1 };
    const field = d.spawnBuilding(s, 'player', home, at);
    d.session.select([field.id]);
  });
  await page
    .locator('.info-panel')
    .getByRole('button', { name: /Jagdflugzeug/ })
    .click();
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as unknown as Game).gameDebug.session.state.players.player.resources.gas,
      ),
    )
    .toBeLessThan(200);

  const target = await page.evaluate(() => {
    const d = (window as unknown as Game).gameDebug;
    const s = d.session.state;
    const home = s.system.homeBodyId;
    d.spawnWarship(s, 'player', home, 'spaceFighter');
    d.spawnWarship(s, 'player', home, 'cruiser');
    const to = s.system.bodies.find((b) => b.id !== home)?.id ?? '';
    d.session.select([]);
    d.session.ui.selectedBodyId = to;
    return to;
  });
  await page
    .locator('.info-panel')
    .getByRole('button', { name: /Flotte hierher schicken/ })
    .click();
  const flying = await page.evaluate(() =>
    (window as unknown as Game).gameDebug.session.state.world
      .with('orbit')
      .entities.filter((e) => e.owner === 'player')
      .map((e) => e.orbit.to),
  );
  expect(flying).toEqual([target, target]);
  expect(errors).toEqual([]);
});
