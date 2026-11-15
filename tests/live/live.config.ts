import { defineConfig, devices } from '@playwright/test';

/** Tests against the live server: `bunx playwright test -c tests/live/live.config.ts`. */
export default defineConfig({
  testDir: '.',
  timeout: 300_000,
  workers: 1,
  use: {
    baseURL: process.env.LIVE_URL ?? 'https://crashlanded.dom-builds.com',
    trace: 'off',
    ...devices['Desktop Chrome'],
  },
});
