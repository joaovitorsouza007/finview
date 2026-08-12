import { prisma } from '../lib/prisma.js';
import { syncConnection } from './bank-sync.js';

const HOUR_MS = 3600000;
const CHECK_INTERVAL_MS = 6 * HOUR_MS; // verifica a cada 6h
const MAX_AGE_MS = 24 * HOUR_MS; // sincroniza itens com mais de 24h desde a última

// Sincronização automática: a cada intervalo, atualiza as conexões ativas
// cujas transações estão desatualizadas (mais de 24h).
export async function runAutoSync() {
  const cutoff = new Date(Date.now() - MAX_AGE_MS);
  const connections = await prisma.bankConnection.findMany({
    where: {
      status: 'ACTIVE',
      OR: [{ lastSync: null }, { lastSync: { lt: cutoff } }],
    },
  });

  for (const connection of connections) {
    try {
      await syncConnection(connection.id);
      console.log(`[banco] ${connection.institutionName} sincronizado automaticamente.`);
    } catch (err) {
      console.log(`[banco] ${connection.institutionName}: ${err.message}`);
    }
  }
  return connections.length;
}

// Inicia o agendador. Não roda durante os testes para não interferir no banco.
export function startBankSyncScheduler() {
  if (process.env.NODE_ENV === 'test') return;
  console.log('[banco] agendador de sincronização iniciado (a cada 6h).');
  runAutoSync().catch(() => {});
  setInterval(() => runAutoSync().catch(() => {}), CHECK_INTERVAL_MS);
}
