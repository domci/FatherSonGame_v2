import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts', 'server/**/*.test.ts'],
    // Some tests play hours of game time (computer enemy); CI with coverage is slow.
    testTimeout: 30_000,
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['src/sim/**', 'src/content/**', 'src/net/**', 'server/**'],
      // Durable Object shells and the Worker entry run only in workerd (checked by e2e).
      exclude: ['**/*.test.ts', 'server/{worker,api,env,lobby,room,room-messages}.ts'],
      thresholds: { lines: 80, functions: 80, branches: 70, statements: 80 },
    },
  },
});
