import { readFileSync } from 'node:fs';
import { defineConfig } from 'vitest/config';

const { version } = JSON.parse(readFileSync('./package.json', 'utf8')) as { version: string };

export default defineConfig({
  // Same build-time constant as tsup.config.ts
  define: { __SDK_VERSION__: JSON.stringify(version) },
  test: {
    environment: 'node',
    passWithNoTests: true,
    setupFiles: ['tests/helpers/setup.ts'],
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 80,
        branches: 80,
        functions: 80,
        statements: 80,
      },
    },
  },
});
