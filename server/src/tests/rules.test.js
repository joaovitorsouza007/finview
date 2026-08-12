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

describe('Categorização inteligente (regras)', () => {
  let token;
  let user;
  let lazer;

  beforeAll(async () => {
    const u = await createUser({ email: 'regras@finview.app' });
    token = u.token;
    user = await prisma.user.findUnique({ where: { email: 'regras@finview.app' } });
    lazer = await prisma.category.findFirst({ where: { userId: user.id, name: 'Lazer' } });
  });

  it('sugere categoria pelas regras do sistema', async () => {
    const res = await request(app)
      .get('/api/rules/suggest?description=Corrida de uber')
      .set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.categoryName).toBe('Transporte');
  });

  it('cria uma regra do usuário', async () => {
    const res = await request(app)
      .post('/api/rules')
      .set(authHeader(token))
      .send({ keyword: 'ifood', categoryId: lazer.id });

    expect(res.status).toBe(201);
    expect(res.body.keyword).toBe('ifood');
    expect(res.body.category.name).toBe('Lazer');
  });

  it('regra do usuário tem prioridade sobre o sistema', async () => {
    const res = await request(app)
      .get('/api/rules/suggest?description=Pedido de ifood em casa')
      .set(authHeader(token));
    // Sistema diria "Alimentação", mas a regra do usuário vence
    expect(res.body.categoryName).toBe('Lazer');
  });

  it('movimentação sem categoria recebe a categoria sugerida', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set(authHeader(token))
      .send({ description: 'ifood do jantar', amount: 80, type: 'EXPENSE', date: '2026-08-01' });

    expect(res.status).toBe(201);
    expect(res.body.categoryId).toBe(lazer.id);
  });

  it('exclui uma regra', async () => {
    const rule = await prisma.rule.findFirst({ where: { userId: user.id, keyword: 'ifood' } });
    const res = await request(app).delete(`/api/rules/${rule.id}`).set(authHeader(token));
    expect(res.status).toBe(200);

    const suggest = await request(app)
      .get('/api/rules/suggest?description=Pedido de ifood')
      .set(authHeader(token));
    // Sem a regra, volta a sugestão do sistema (Alimentação)
    expect(suggest.body.categoryName).toBe('Alimentação');
  });
});
