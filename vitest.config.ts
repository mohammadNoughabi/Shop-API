import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import { loadEnv } from 'vite';

export default defineConfig({
  plugins: [tsconfigPaths()],

  test: {
    globals: true,
    environment: 'node',

    // Load environment variables for the test environment
    env: loadEnv('test', process.cwd(), ''),
    // Look inside test folder
    include: ['test/**/*.{test,spec}.ts'],

    setupFiles: ['./test/setup/vitest.setup.ts'],
    globalSetup: ['./test/setup/global.setup.ts'],
    testTimeout: 30000,
    hookTimeout: 60000,

    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.d.ts',
        'test/**',
        'src/**/*.config.ts',
      ],
    },
  },
});
