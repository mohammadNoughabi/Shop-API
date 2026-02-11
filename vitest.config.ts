import { defineConfig } from 'vitest/config.ts';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()], // This makes your tsconfig paths work in tests (future-proof)

  test: {
    globals: true, // No need to import describe/it/expect every time
    environment: 'node', // Very important for backend
    include: ['src/**/*.{test,spec}.{ts,js}'],

    setupFiles: ['./test/setup.ts'], // We'll create this next

    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.d.ts',
        'test/**',
        'src/test/**',
        'src/**/*.config.ts',
      ],
    },
  },
});
