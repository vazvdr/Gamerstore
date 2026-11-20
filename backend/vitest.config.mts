import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: { globals: true, root: './', include: ['apps/**/test/**/*.spec.ts'] },
});