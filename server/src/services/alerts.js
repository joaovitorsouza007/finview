import { prisma } from '../lib/prisma.js';
import { startOfMonth, addDays, addMonths, startOfDay } from '../utils/dates.js';

// Gera os alertas preventivos do usuário:
//   category_limit -> gasto na categoria >= 80% da média dos 3 meses anteriores
//   low_balance    -> saldo projetado para o fim do mês negativo
//   goal_reminder  -> lembrete de quanto falta para a meta de investimento
// Os alertas são deduplicados por (tipo + título) dentro do mês corrente.

async function push(userId, type, title, message) {
  const monthStart = startOfMonth(new Date());
  const exists = await prisma.notification.findFirst({
    where: { userId, type, title, createdAt: { gte: monthStart } },
  });
  if (exists) return false;
  await prisma.notification.create({ data: { userId, type, title, message } });
  return true;
}

function sum(list) {
  return list.reduce((s, t) => s + t.amount, 0);
}

export async function generateAlerts(userId) {
  let created = 0;
  const now = new Date();
  const monthStart = startOfMonth(now);
  const nextMonth = addMonths(monthStart, 1);

  // Movimentações do mês atual e dos 3 meses anteriores (para a média)
  const [monthTx, pastTx] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId, date: { gte: monthStart, lt: nextMonth } },
      include: { category: true },
    }),
    prisma.transaction.findMany({
      where: { userId, type: 'EXPENSE', date: { gte: startOfMonth(addMonths(monthStart, -3)), lt: monthStart } },
      include: { category: true },
    }),
  ]);

  const expenses = monthTx.filter((t) => t.type === 'EXPENSE');
  const incomes = monthTx.filter((t) => t.type === 'INCOME');

  // 1) Limite por categoria: gasto atual >= 80% da média dos 3 meses anteriores
  const curByCat = new Map();
  for (const t of expenses) curByCat.set(t.categoryId || 'none', (curByCat.get(t.categoryId || 'none') || 0) + t.amount);
  const pastByCat = new Map();
  for (const t of pastTx) pastByCat.set(t.categoryId || 'none', (pastByCat.get(t.categoryId || 'none') || 0) + t.amount);

  for (const [key, cur] of curByCat) {
    const prev = pastByCat.get(key) || 0;
    if (prev <= 0) continue;
    const avg = prev / 3;
    if (cur >= avg * 0.8) {
      const cat = expenses.find((t) => (t.categoryId || 'none') === key)?.category;
      const name = cat?.name || 'Outros';
      const ok = await push(
        userId,
        'category_limit',
        `Limite de ${name}`,
        `Você já gastou R$ ${(cur / 100).toFixed(2)} em ${name} — 80% ou mais da sua média dos últimos 3 meses.`
      );
      if (ok) created++;
    }
  }

  // 2) Saldo projetado para o fim do mês
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const incomeNow = sum(incomes);
  const expenseNow = sum(expenses);
  const monthlyIncome = user?.monthlyIncome ?? incomeNow;
  const projected = monthlyIncome - expenseNow;
  if (expenseNow > 0 && projected < 0) {
    const ok = await push(
      userId,
      'low_balance',
      'Atenção: saldo projetado negativo',
      `Se seu saldo mensal seguir assim, o mês termina com R$ ${(projected / 100).toFixed(2)}. Vale revisar os gastos.`
    );
    if (ok) created++;
  }

  // 3) Lembrete da meta de investimento
  const goal = await prisma.goal.findUnique({ where: { userId } });
  if (goal?.percent > 0) {
    const invested = expenses.filter((t) => t.category?.isInvestment).reduce((s, t) => s + t.amount, 0);
    const target = Math.round((monthlyIncome * goal.percent) / 100);
    if (target > 0 && invested < target) {
      const ok = await push(
        userId,
        'goal_reminder',
        'Meta de investimento',
        `Faltam R$ ${((target - invested) / 100).toFixed(2)} para bater a meta de ${goal.percent}% este mês.`
      );
      if (ok) created++;
    }
  }

  return created;
}
