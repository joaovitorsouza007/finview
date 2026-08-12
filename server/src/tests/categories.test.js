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

describe('Categorias', () => {
  let token;
  let user;

  beforeAll(async () => {
    const u = await createUser({ email: 'duda@finview.app' });
    token = u.token;
    user = await prisma.user.findUnique({ where: { email: 'duda@finview.app' } });
  });

  it('lista as categorias padrão com contagem de movimentações', async () => {
    const res = await request(app).get('/api/categories').set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(10);
    expect(res.body[0]).toHaveProperty('icon');
    expect(res.body[0]).toHaveProperty('_count');
    expect(res.body[0]._count.transactions).toBe(0);
  });

  it('cria uma nova categoria com ícone e cor', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set(authHeader(token))
      .send({ name: 'Pet', color: '#0ea5e9', icon: '🐾' });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Pet');
    expect(res.body.icon).toBe('🐾');
    expect(res.body.color).toBe('#0ea5e9');
  });

  it('rejeita categoria duplicada', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set(authHeader(token))
      .send({ name: 'Pet' });

    expect(res.status).toBe(409);
  });

  it('ao excluir, reatribui as movimentações para Outros', async () => {
    const pet = await prisma.category.findFirst({ where: { userId: user.id, name: 'Pet' } });
    const outros = await prisma.category.findFirst({ where: { userId: user.id, name: 'Outros' } });

    await prisma.transaction.create({
      data: {
        userId: user.id,
        description: 'Ração do cachorro',
        amount: 8900,
        type: 'EXPENSE',
        date: new Date(),
        categoryId: pet.id,
        source: 'MANUAL',
      },
    });

    const res = await request(app).delete(`/api/categories/${pet.id}`).set(authHeader(token));
    expect(res.status).toBe(200);

    const tx = await prisma.transaction.findFirst({
      where: { userId: user.id, description: 'Ração do cachorro' },
    });
    expect(tx.categoryId).toBe(outros.id);
  });

  it('não permite excluir a categoria padrão Outros', async () => {
    const outros = await prisma.category.findFirst({ where: { userId: user.id, name: 'Outros' } });
    const res = await request(app).delete(`/api/categories/${outros.id}`).set(authHeader(token));
    expect(res.status).toBe(400);
  });

  it('atualiza nome, ícone e cor de uma categoria', async () => {
    const created = await request(app)
      .post('/api/categories')
      .set(authHeader(token))
      .send({ name: 'Viagem', icon: '✈️', color: '#0ea5e9' });
    expect(created.status).toBe(201);

    const res = await request(app)
      .put(`/api/categories/${created.body.id}`)
      .set(authHeader(token))
      .send({ name: 'Férias', icon: '🌴', color: '#8b5cf6' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Férias');
    expect(res.body.icon).toBe('🌴');
    expect(res.body.color).toBe('#8b5cf6');
  });

  it('não permite renomear a categoria padrão Outros', async () => {
    const outros = await prisma.category.findFirst({ where: { userId: user.id, name: 'Outros' } });
    const res = await request(app)
      .put(`/api/categories/${outros.id}`)
      .set(authHeader(token))
      .send({ name: 'Geral' });

    expect(res.status).toBe(400);
  });
});
