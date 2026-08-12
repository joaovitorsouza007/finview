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

describe('Alertas e notificações', () => {
  let token;
  let user;
  let lazer;

  beforeAll(async () => {
    const u = await createUser({ email: 'alerta@finview.app' });
    token = u.token;
    user = await prisma.user.findUnique({ where: { email: 'alerta@finview.app' } });
    lazer = await prisma.category.findFirst({ where: { userId: user.id, name: 'Lazer' } });

    // Renda mensal definida no onboarding + meta de 10%
    await prisma.user.update({ where: { id: user.id }, data: { monthlyIncome: 500000 } });
    await prisma.goal.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id, percent: 10 } });

    // 3 meses anteriores gastando R$ 1.000/mês em Lazer (média = R$ 1.000)
    const now = new Date();
    for (let m = 3; m >= 1; m--) {
      await prisma.transaction.create({
        data: {
          userId: user.id,
          description: 'Lazer antigo',
          amount: 100000,
          type: 'EXPENSE',
          date: new Date(now.getFullYear(), now.getMonth() - m, 15),
          categoryId: lazer.id,
          source: 'MOCK',
        },
      });
    }

    // Mês atual: R$ 900 em Lazer (90% da média -> dispara o alerta) e sem aportes
    await prisma.transaction.create({
      data: {
        userId: user.id,
        description: 'Lazer atual',
        amount: 90000,
        type: 'EXPENSE',
        date: new Date(),
        categoryId: lazer.id,
        source: 'MOCK',
      },
    });
  });

  it('gera alertas de limite de categoria e meta de investimento', async () => {
    const res = await request(app).post('/api/notifications/check').set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.created).toBeGreaterThanOrEqual(1);

    const types = res.body.notifications.map((n) => n.type);
    expect(types).toContain('category_limit');
    // Meta 10% de R$ 5.000 = R$ 500; não investiu nada -> lembrete
    expect(types).toContain('goal_reminder');
  });

  it('não duplica alertas na mesma checagem', async () => {
    const res = await request(app).post('/api/notifications/check').set(authHeader(token));
    expect(res.body.created).toBe(0);
  });

  it('marca notificação como lida', async () => {
    const list = await request(app).get('/api/notifications').set(authHeader(token));
    const n = list.body.find((x) => !x.read);
    const res = await request(app).patch(`/api/notifications/${n.id}/read`).set(authHeader(token));
    expect(res.status).toBe(200);

    const after = await request(app).get('/api/notifications').set(authHeader(token));
    expect(after.body.find((x) => x.id === n.id).read).toBe(true);
  });
});
