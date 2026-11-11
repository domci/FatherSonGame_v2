import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 120_000,
  retries: process.env.CI ? 1 : 0,
  use: { baseURL: 'http://localhost:4173', trace: 'off' },
  webServer: {
    command: 'bun run build && bun run preview -- --port 4173 --strictPort',
    port: 4173,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    // Tablet: only the smoke test, because software rendering of a big retina screen is slow in CI.
    {
      name: 'tablet',
      grep: /see the base/,
      // A big retina screen in software rendering: one picture can take a minute in CI.
      timeout: 240_000,
      use: { ...devices['iPad Pro 11'], browserName: 'chromium' },
    },
  ],
});
