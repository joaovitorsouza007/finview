import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globalSetup: './src/tests/global-setup.js',
    // Compartilhamos um único banco SQLite: os arquivos devem rodar em sequência
    // para não resetar os dados uns dos outros.
    fileParallelism: false,
  },
});
