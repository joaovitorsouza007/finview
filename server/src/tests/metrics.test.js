import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app, resetDb, createUser, authHeader } from './helpers.js';
import { prisma } from '../lib/prisma.js';

beforeAll(async () => {
  await resetDb();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Métricas do dashboard', () => {
  let token;

  beforeAll(async () => {
    const u = await createUser({ email: 'carla@finview.app' });
    token = u.token;

    const user = await prisma.user.findUnique({ where: { email: 'carla@finview.app' } });
    const categories = await prisma.category.findMany({ where: { userId: user.id } });
    const byName = Object.fromEntries(categories.map((c) => [c.name, c]));

    await prisma.transaction.createMany({
      data: [
        {
          userId: user.id,
          description: 'Salário',
          amount: 500000, // R$ 5.000
          type: 'INCOME',
          date: new Date(),
          categoryId: byName['Salário'].id,
          source: 'MOCK',
        },
        {
          userId: user.id,
          description: 'Mercado',
          amount: 50000, // R$ 500
          type: 'EXPENSE',
          date: new Date(),
          categoryId: byName['Alimentação'].id,
          source: 'MOCK',
        },
        {
          userId: user.id,
          description: 'Tesouro Direto',
          amount: 100000, // R$ 1.000
          type: 'EXPENSE',
          date: new Date(),
          categoryId: byName['Investimentos'].id,
          source: 'MOCK',
        },
      ],
    });
  });

  it('calcula resumo, gastos por categoria e meta de investimento', async () => {
    const res = await request(app)
      .get('/api/metrics?period=month')
      .set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.summary.income).toBe(500000);
    expect(res.body.summary.expense).toBe(150000);
    expect(res.body.summary.balance).toBe(350000);

    const alimentacao = res.body.byCategory.find((c) => c.name === 'Alimentação');
    expect(alimentacao.total).toBe(50000);

    // Meta de 10% de R$ 5.000 = R$ 500; guardou R$ 1.000
    expect(res.body.goal.target).toBe(50000);
    expect(res.body.goal.invested).toBe(100000);
    expect(res.body.goal.progress).toBe(100);
    expect(res.body.balanceOverTime.length).toBeGreaterThan(0);
  });

  it('filtra por categoria e atualiza o resumo', async () => {
    const user = await prisma.user.findUnique({ where: { email: 'carla@finview.app' } });
    const categories = await prisma.category.findMany({ where: { userId: user.id } });
    const alimentacao = categories.find((c) => c.name === 'Alimentação');

    const res = await request(app)
      .get(`/api/metrics?period=month&categoryId=${alimentacao.id}`)
      .set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.summary.expense).toBe(50000);
    expect(res.body.summary.count).toBe(1);
  });

  it('atualiza a meta de investimento', async () => {
    const res = await request(app)
      .put('/api/goal')
      .set(authHeader(token))
      .send({ percent: 15 });

    expect(res.status).toBe(200);
    expect(res.body.percent).toBe(15);

    const get = await request(app).get('/api/goal').set(authHeader(token));
    expect(get.body.percent).toBe(15);
  });

  it('rejeita meta fora do intervalo', async () => {
    const res = await request(app)
      .put('/api/goal')
      .set(authHeader(token))
      .send({ percent: 150 });

    expect(res.status).toBe(400);
  });

  it('retorna comparativo com o período anterior', async () => {
    const user = await prisma.user.findUnique({ where: { email: 'carla@finview.app' } });

    // Gastos do mês passado para gerar base de comparação
    const now = new Date();
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 10);
    await prisma.transaction.createMany({
      data: [
        {
          userId: user.id,
          description: 'Mercado (mês passado)',
          amount: 200000, // R$ 2.000
          type: 'EXPENSE',
          date: prevMonth,
          source: 'MOCK',
        },
        {
          userId: user.id,
          description: 'Salário (mês passado)',
          amount: 500000,
          type: 'INCOME',
          date: prevMonth,
          source: 'MOCK',
        },
      ],
    });

    const res = await request(app).get('/api/metrics?period=month').set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.compare).toHaveProperty('prevExpense');
    expect(res.body.compare).toHaveProperty('expenseDeltaPct');
    // mês atual gastou R$ 1.500 vs R$ 2.000 no passado -> -25%
    expect(res.body.compare.expenseDeltaPct).toBe(-25);
    expect(res.body.monthly.length).toBe(6);
    expect(res.body.monthly[5]).toHaveProperty('income');
    expect(res.body.monthly[5]).toHaveProperty('expense');
  });

  it('retorna saldo por conta e consolidado', async () => {
    const user = await prisma.user.findUnique({ where: { email: 'carla@finview.app' } });

    const account = await request(app)
      .post('/api/accounts')
      .set(authHeader(token))
      .send({ name: 'Corrente', type: 'checking', initialBalance: 1000 });
    expect(account.status).toBe(201);

    await request(app)
      .post('/api/transactions')
      .set(authHeader(token))
      .send({ description: 'Compra no débito', amount: 100, type: 'EXPENSE', date: '2026-08-01', accountId: account.body.id });

    const res = await request(app).get('/api/metrics?period=month').set(authHeader(token));
    expect(res.status).toBe(200);
    const acc = res.body.accounts.find((a) => a.id === account.body.id);
    // 1.000 (inicial) - 100 (débito) = 900
    expect(acc.balance).toBe(90000);
    expect(res.body.accountsTotal).toBeGreaterThanOrEqual(90000);
  });
});
