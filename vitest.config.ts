import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],

  test: {
    globals: true,
    environment: 'node',

    // Look inside test folder
    include: ['test/**/*.{test,spec}.ts'],

    // Correct path
    setupFiles: ['./test/setup.ts'],

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
