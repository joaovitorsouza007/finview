import { prisma } from '../lib/prisma.js';
import { dateRange, startOfDay, addDays, addMonths, startOfMonth } from '../utils/dates.js';

// Constrói os "baldes" de tempo para a linha de evolução do saldo
function bucketBounds(period) {
  const today = startOfDay(new Date());
  if (period === 'week') {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = addDays(today, -i);
      days.push({
        label: d.toLocaleDateString('pt-BR', { weekday: 'short' }),
        start: d,
        end: addDays(d, 1),
      });
    }
    return days;
  }
  if (period === 'month') {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = addDays(today, -i);
      days.push({
        label: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        start: d,
        end: addDays(d, 1),
      });
    }
    return days;
  }
  const months = [];
  for (let i = 11; i >= 0; i--) {
    const start = startOfMonth(addMonths(today, -i));
    months.push({
      label: start.toLocaleDateString('pt-BR', { month: 'short' }),
      start,
      end: startOfMonth(addMonths(start, 1)),
    });
  }
  return months;
}

function summarize(list) {
  let income = 0;
  let expense = 0;
  for (const t of list) {
    if (t.type === 'INCOME') income += t.amount;
    else expense += t.amount;
  }
  return { income, expense, balance: income - expense };
}

// Série de receitas x despesas dos últimos 6 meses (mês a mês)
async function monthlySeries(userId) {
  const result = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const start = startOfMonth(addMonths(now, -i));
    const end = startOfMonth(addMonths(start, 1));
    const txs = await prisma.transaction.findMany({
      where: { userId, date: { gte: start, lt: end } },
      select: { amount: true, type: true },
    });
    const s = summarize(txs);
    result.push({
      label: start.toLocaleDateString('pt-BR', { month: 'short' }),
      income: s.income,
      expense: s.expense,
    });
  }
  return result;
}

// Saldo atual por conta (saldo inicial + movimentações)
async function accountBalances(userId) {
  const accounts = await prisma.account.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } });
  if (accounts.length === 0) return { accounts: [], total: null };

  const txs = await prisma.transaction.findMany({
    where: { userId, accountId: { not: null } },
    select: { accountId: true, amount: true, type: true },
  });

  const net = new Map();
  for (const t of txs) {
    const delta = t.type === 'INCOME' ? t.amount : -t.amount;
    net.set(t.accountId, (net.get(t.accountId) || 0) + delta);
  }

  let total = 0;
  const enriched = accounts.map((a) => {
    const balance = a.initialBalance + (net.get(a.id) || 0);
    total += balance;
    return {
      id: a.id,
      name: a.name,
      type: a.type,
      color: a.color,
      balance,
    };
  });

  return { accounts: enriched, total };
}

// Calcula todos os números do dashboard
export async function getMetrics(userId, { period = 'month', categoryId = null } = {}) {
  const { from, to } = dateRange(period);
  const toExclusive = addDays(to, 1);

  // Transações filtradas (período + categoria) -> usadas nos cartões, pizza e linha
  const where = {
    userId,
    date: { gte: from, lt: toExclusive },
    ...(categoryId ? { categoryId } : {}),
  };

  const txs = await prisma.transaction.findMany({
    where,
    include: { category: true },
    orderBy: { date: 'asc' },
  });

  const income = txs.filter((t) => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
  const expense = txs.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);

  const byCategory = new Map();
  for (const t of txs) {
    if (t.type !== 'EXPENSE') continue;
    const key = t.categoryId || 'none';
    const cur = byCategory.get(key) || {
      name: t.category?.name || 'Outros',
      color: t.category?.color || '#6b7280',
      icon: t.category?.icon || '',
      total: 0,
    };
    cur.total += t.amount;
    byCategory.set(key, cur);
  }

  // Evolução do saldo (valor acumulado: o que entrou menos o que saiu)
  const buckets = bucketBounds(period);
  let running = 0;
  let idx = 0;
  const balanceOverTime = buckets.map((b) => {
    while (idx < txs.length && txs[idx].date < b.end) {
      const t = txs[idx];
      running += t.type === 'INCOME' ? t.amount : -t.amount;
      idx++;
    }
    return { label: b.label, saldo: running };
  });

  // Meta de investimento: usada o período inteiro, independente do filtro de categoria
  const goal = await prisma.goal.findUnique({ where: { userId } });
  const periodTx = await prisma.transaction.findMany({
    where: { userId, date: { gte: from, lt: toExclusive } },
    include: { category: true },
  });

  const periodIncome = periodTx
    .filter((t) => t.type === 'INCOME')
    .reduce((s, t) => s + t.amount, 0);

  const invested = periodTx
    .filter((t) => t.type === 'EXPENSE' && t.category?.isInvestment)
    .reduce((s, t) => s + t.amount, 0);

  const percent = goal?.percent ?? 10;
  const target = Math.round((periodIncome * percent) / 100);

  // Comparativo com o período anterior (mesmo tamanho, logo antes)
  const durationDays = Math.round((to - from) / 86400000) + 1;
  const prevFrom = addDays(from, -durationDays);
  const prevTo = addDays(from, -1);
  const prevTx = await prisma.transaction.findMany({
    where: { userId, date: { gte: prevFrom, lt: addDays(prevTo, 1) }, ...(categoryId ? { categoryId } : {}) },
  });
  const prev = summarize(prevTx);

  const pct = (cur, prevVal) => {
    if (prevVal === 0) return null; // sem base de comparação
    return Math.round(((cur - prevVal) / prevVal) * 100);
  };

  // Tabela comparativa por categoria: atual vs anterior
  const compareByCategory = await compareCategories(userId, { from, toExclusive, prevFrom, prevTo });

  // Saldo por conta (consolidado)
  const { accounts, total: accountsTotal } = await accountBalances(userId);
  const monthly = await monthlySeries(userId);

  return {
    period,
    from,
    to,
    summary: {
      income,
      expense,
      balance: income - expense,
      count: txs.length,
    },
    compare: {
      prevIncome: prev.income,
      prevExpense: prev.expense,
      incomeDeltaPct: pct(income, prev.income),
      expenseDeltaPct: pct(expense, prev.expense),
    },
    byCategory: [...byCategory.values()].sort((a, b) => b.total - a.total),
    balanceOverTime,
    monthly,
    compareByCategory,
    accounts,
    accountsTotal,
    goal: {
      percent,
      invested,
      target,
      progress: target > 0 ? Math.min(100, Math.round((invested / target) * 100)) : 0,
    },
  };
}

// Comparativo de gastos por categoria: mês atual vs mês anterior
async function compareCategories(userId, { from, toExclusive, prevFrom, prevTo }) {
  const [cur, prev] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId, type: 'EXPENSE', date: { gte: from, lt: toExclusive } },
      include: { category: true },
    }),
    prisma.transaction.findMany({
      where: { userId, type: 'EXPENSE', date: { gte: prevFrom, lt: addDays(prevTo, 1) } },
      include: { category: true },
    }),
  ]);

  const map = (list) => {
    const m = new Map();
    for (const t of list) {
      const key = t.categoryId || 'none';
      const cur2 = m.get(key) || { name: t.category?.name || 'Outros', icon: t.category?.icon || '', color: t.category?.color || '#6b7280', current: 0, previous: 0 };
      cur2.current += t.amount;
      m.set(key, cur2);
    }
    return m;
  };
  const curMap = map(cur);

  for (const t of prev) {
    const key = t.categoryId || 'none';
    if (!curMap.has(key)) {
      curMap.set(key, { name: t.category?.name || 'Outros', icon: t.category?.icon || '', color: t.category?.color || '#6b7280', current: 0, previous: 0 });
    }
    curMap.get(key).previous += t.amount;
  }

  return [...curMap.values()]
    .map((c) => ({
      ...c,
      deltaPct: c.previous === 0 ? null : Math.round(((c.current - c.previous) / c.previous) * 100),
    }))
    .sort((a, b) => b.current - a.current);
}
