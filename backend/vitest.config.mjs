import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.js'],
    // vsi testi uporabljajo isto testno bazo, zato tečejo zaporedno
    fileParallelism: false,
    testTimeout: 20000,
    hookTimeout: 30000,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.js'],
      exclude: ['src/server.js', 'src/seed.js'],
      reporter: ['text', 'html', 'lcov'],
    },
  },
});
