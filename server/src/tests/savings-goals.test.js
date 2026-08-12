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

describe('Metas personalizadas (SavingsGoal)', () => {
  let token;
  let user;

  beforeAll(async () => {
    const u = await createUser({ email: 'metas@finview.app' });
    token = u.token;
    user = await prisma.user.findUnique({ where: { email: 'metas@finview.app' } });
  });

  it('cria, lista, edita e exclui metas', async () => {
    const created = await request(app)
      .post('/api/savings-goals')
      .set(authHeader(token))
      .send({ name: 'Viagem para a Europa', targetAmount: 15000, savedAmount: 3000, targetDate: '2027-06-30' });

    expect(created.status).toBe(201);
    expect(created.body.targetAmount).toBe(1500000);
    expect(created.body.savedAmount).toBe(300000);

    const list = await request(app).get('/api/savings-goals').set(authHeader(token));
    expect(list.body.length).toBe(1);

    const updated = await request(app)
      .put(`/api/savings-goals/${created.body.id}`)
      .set(authHeader(token))
      .send({ savedAmount: 5000 });
    expect(updated.status).toBe(200);
    expect(updated.body.savedAmount).toBe(500000);

    const del = await request(app).delete(`/api/savings-goals/${created.body.id}`).set(authHeader(token));
    expect(del.status).toBe(200);
  });

  it('soma os gastos da categoria ligada à meta como "guardado"', async () => {
    const invest = await prisma.category.findFirst({ where: { userId: user.id, name: 'Investimentos' } });
    const goal = await request(app)
      .post('/api/savings-goals')
      .set(authHeader(token))
      .send({ name: 'Reserva via aportes', targetAmount: 5000, categoryId: invest.id });

    expect(goal.status).toBe(201);

    await request(app)
      .post('/api/transactions')
      .set(authHeader(token))
      .send({ description: 'Aporte', amount: 700, type: 'EXPENSE', date: '2026-08-01', categoryId: invest.id });

    const list = await request(app).get('/api/savings-goals').set(authHeader(token));
    const g = list.body.find((x) => x.id === goal.body.id);
    expect(g.savedAmount).toBe(70000);
  });
});
