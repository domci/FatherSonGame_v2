import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts', 'server/**/*.test.ts'],
    // Some tests play hours of game time (computer enemy); CI with coverage is slow.
    testTimeout: 30_000,
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['src/sim/**', 'src/content/**', 'src/net/**', 'src/online/**', 'server/**'],
      // Durable Object shells, the Worker entry and the WebSocket run only in workerd or a
      // browser (checked by e2e).
      exclude: [
        '**/*.test.ts',
        'server/{worker,api,env,lobby,room,room-messages}.ts',
        'src/online/connection.ts',
      ],
      thresholds: { lines: 80, functions: 80, branches: 70, statements: 80 },
    },
  },
});
