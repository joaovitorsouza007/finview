import { prisma } from '../lib/prisma.js';
import { getItemStatus, getItemAccounts, getItemTransactions, getCategoryName, CATEGORY_MAP } from './pluggy.js';
import { matchCategoryId } from './categorize.js';

const DAYS_MS = 86400000;

// Traduz o status do Pluggy para o status amigável do FinView
function mapStatus(pluggyStatus) {
  if (pluggyStatus === 'LOGIN_ERROR') return 'ERROR';
  if (pluggyStatus === 'LOGIN_REQUIRED') return 'EXPIRED';
  return 'ACTIVE';
}

// Escolhe a categoria: primeiro a categoria do banco (se mapeada), senão as
// regras do usuário/sistema, senão "Outros".
async function resolveBankCategory(userId, pluggyName, description) {
  if (pluggyName) {
    const mapped = CATEGORY_MAP[String(pluggyName).toLowerCase().trim()];
    const name = mapped || pluggyName;
    const cat = await prisma.category.findFirst({ where: { userId, name } });
    if (cat) return cat.id;
  }
  return matchCategoryId(userId, description);
}

// Importa as transações de uma conexão bancária (deduplicadas por externalId).
// Retorna um resumo para exibição no fluxo de conexão.
export async function syncConnection(connectionId) {
  const connection = await prisma.bankConnection.findUnique({ where: { id: connectionId } });
  if (!connection) throw new Error('Conexão bancária não encontrada.');
  if (!connection.itemId) throw new Error('A conexão ainda não foi autorizada.');

  // 1) Verifica a sessão no banco
  let status;
  try {
    status = await getItemStatus(connection.itemId);
  } catch {
    await prisma.bankConnection.update({
      where: { id: connection.id },
      data: { status: 'ERROR', lastError: 'Não foi possível falar com o banco agora. Tente novamente em alguns minutos.' },
    });
    throw new Error('O banco está temporariamente indisponível.');
  }

  const finalStatus = mapStatus(status);
  if (finalStatus !== 'ACTIVE') {
    const message =
      finalStatus === 'EXPIRED'
        ? 'Sua conexão expirou. Clique em "Reconectar" para autorizar novamente.'
        : 'Não foi possível entrar no seu banco. Verifique seus dados de acesso e reconecte.';
    await prisma.bankConnection.update({
      where: { id: connection.id },
      data: { status: finalStatus, lastError: message },
    });
    throw new Error(message);
  }

  // 2) Saldo atual (soma das contas encontradas)
  const accounts = await getItemAccounts(connection.itemId);
  const balance = accounts.reduce((s, a) => s + Math.round((a.balance || 0) * 100), 0);
  await prisma.bankConnection.update({ where: { id: connection.id }, data: { status: 'ACTIVE', balance, lastError: null } });

  // 3) Transações: últimos 90 dias, ou desde a última sincronização
  const to = new Date();
  const from = connection.lastSync ? new Date(connection.lastSync.getTime() - DAYS_MS) : new Date(Date.now() - 90 * DAYS_MS);
  const pluggyTx = await getItemTransactions(connection.itemId, from, to);

  // Busca os externalIds já importados para deduplicar
  const externalIds = pluggyTx.map((t) => t.id).filter(Boolean);
  const existingRows = await prisma.transaction.findMany({
    where: { userId: connection.userId, externalId: { in: externalIds } },
    select: { externalId: true },
  });
  const existing = new Set(existingRows.map((r) => r.externalId));

  let created = 0;
  let updated = 0;

  for (const tx of pluggyTx) {
    const amount = Math.abs(Math.round((tx.amount || 0) * 100));
    if (amount === 0) continue;
    const date = new Date(tx.date);
    if (Number.isNaN(date.getTime())) continue;

    const type = String(tx.type).toUpperCase() === 'CREDIT' ? 'INCOME' : 'EXPENSE';
    const pluggyName = await getCategoryName(tx.categoryId);
    const categoryId = await resolveBankCategory(connection.userId, pluggyName, tx.description);
    const data = {
      description: String(tx.description).slice(0, 300) || 'Sem descrição',
      amount,
      type,
      date,
      categoryId,
      bankConnectionId: connection.id,
    };

    if (existing.has(tx.id)) {
      await prisma.transaction.updateMany({
        where: { userId: connection.userId, externalId: tx.id },
        data,
      });
      updated++;
    } else {
      await prisma.transaction.create({
        data: {
          userId: connection.userId,
          externalId: tx.id,
          source: 'BANK',
          ...data,
        },
      });
      created++;
    }
  }

  // 4) Marca a última sincronização
  await prisma.bankConnection.update({ where: { id: connection.id }, data: { lastSync: new Date() } });

  return { created, updated, accounts, balance };
}

// Dados completos de uma conexão para a listagem de bancos
export async function getConnectionDetail(connection) {
  const txCount = await prisma.transaction.count({ where: { bankConnectionId: connection.id } });
  return {
    id: connection.id,
    institution: connection.institution,
    institutionName: connection.institutionName,
    status: connection.status,
    lastError: connection.lastError,
    lastSync: connection.lastSync,
    balance: connection.balance,
    transactionCount: txCount,
  };
}
