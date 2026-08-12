import 'dotenv/config';
import { createApp } from './app.js';
import { startBankSyncScheduler } from './services/bank-scheduler.js';

const port = process.env.PORT || 4000;

createApp().listen(port, () => {
  console.log(`FinView API rodando em http://localhost:${port}`);
});

// Sincronização automática dos bancos conectados (a cada 6h)
startBankSyncScheduler();
