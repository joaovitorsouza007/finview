import { prisma } from '../lib/prisma.js';
import { getItemStatus, getItemAccounts, getItemTransactions, getCategoryName, CATEGORY_MAP } from './pluggy.js';
import { categorize, normalize } from './categorize.js';

const DAYS_MS = 86400000;

// Traduz o status do Pluggy para o status amigável do FinView
function mapStatus(pluggyStatus) {
  if (pluggyStatus === 'LOGIN_ERROR') return 'ERROR';
  if (pluggyStatus === 'LOGIN_REQUIRED') return 'EXPIRED';
  return 'ACTIVE';
}

// Escolhe a categoria em memória (sem consultar o banco por transação):
// 1) categoria do banco mapeada, 2) regras do usuário, 3) regras do sistema,
// 4) "Outros".
function resolveBankCategory(pluggyName, description, categoriesByName, userRules) {
  if (pluggyName) {
    const mapped = CATEGORY_MAP[String(pluggyName).toLowerCase().trim()];
    const name = mapped || pluggyName;
    const catId = categoriesByName.get(name);
    if (catId) return catId;
  }

  const text = normalize(description);
  if (text) {
    for (const rule of userRules) {
      if (rule.keyword && text.includes(normalize(rule.keyword))) return rule.categoryId;
    }
    const systemId = categoriesByName.get(categorize(description));
    if (systemId) return systemId;
    const outrosId = categoriesByName.get('Outros');
    if (outrosId) return outrosId;
  }
  return null;
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

  // Pré-carrega categorias e regras do usuário para resolver tudo em memória
  // (evita uma consulta por transação no banco remoto).
  const [categories, userRules] = await Promise.all([
    prisma.category.findMany({ where: { userId: connection.userId }, select: { id: true, name: true } }),
    prisma.rule.findMany({ where: { userId: connection.userId }, select: { keyword: true, categoryId: true } }),
  ]);
  const categoriesByName = new Map(categories.map((c) => [c.name, c.id]));

  // Busca os externalIds já importados para deduplicar
  const externalIds = pluggyTx.map((t) => t.id).filter(Boolean);
  const existingRows = await prisma.transaction.findMany({
    where: { userId: connection.userId, externalId: { in: externalIds } },
    select: { externalId: true },
  });
  const existing = new Set(existingRows.map((r) => r.externalId));

  const toCreate = [];
  const toUpdate = [];

  for (const tx of pluggyTx) {
    const amount = Math.abs(Math.round((tx.amount || 0) * 100));
    if (amount === 0) continue;
    const date = new Date(tx.date);
    if (Number.isNaN(date.getTime())) continue;

    const type = String(tx.type).toUpperCase() === 'CREDIT' ? 'INCOME' : 'EXPENSE';
    const pluggyName = await getCategoryName(tx.categoryId);
    const categoryId = resolveBankCategory(pluggyName, tx.description, categoriesByName, userRules);
    const data = {
      description: String(tx.description).slice(0, 300) || 'Sem descrição',
      amount,
      type,
      date,
      categoryId,
      bankConnectionId: connection.id,
    };

    if (existing.has(tx.id)) toUpdate.push({ externalId: tx.id, data });
    else toCreate.push({ externalId: tx.id, ...data });
  }

  // Grava em lote: um createMany + uma transação de updates (o Postgres remoto
  // é lento, então evitar ~30 round-trips por sincronização faz muita diferença).
  let created = 0;
  let updated = 0;

  if (toCreate.length > 0) {
    const res = await prisma.transaction.createMany({
      data: toCreate.map((t) => ({ userId: connection.userId, source: 'BANK', ...t })),
      skipDuplicates: true,
    });
    created = res.count;
  }

  if (toUpdate.length > 0) {
    const results = await prisma.$transaction(
      toUpdate.map((t) =>
        prisma.transaction.updateMany({
          where: { userId: connection.userId, externalId: t.externalId },
          data: t.data,
        })
      )
    );
    updated = results.reduce((sum, r) => sum + r.count, 0);
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
