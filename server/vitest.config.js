import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globalSetup: './src/tests/global-setup.js',
    // Compartilhamos um único banco PostgreSQL de teste (finview_test): os
    // arquivos devem rodar em sequência para não resetar os dados uns dos outros.
    fileParallelism: false,
    // O banco de teste é Postgres remoto (Supabase): cada query leva centenas
    // de ms, então os testes de integração precisam de margem maior.
    testTimeout: 30000,
  },
});
