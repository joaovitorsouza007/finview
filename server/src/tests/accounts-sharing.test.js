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

describe('Contas', () => {
  let token;
  let user;

  beforeAll(async () => {
    const u = await createUser({ email: 'contas@finview.app' });
    token = u.token;
    user = await prisma.user.findUnique({ where: { email: 'contas@finview.app' } });
  });

  it('cria uma conta com saldo inicial e calcula o saldo atual', async () => {
    const res = await request(app)
      .post('/api/accounts')
      .set(authHeader(token))
      .send({ name: 'Poupança', type: 'savings', initialBalance: 2500, color: '#0ea5e9' });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Poupança');
    expect(res.body.balance).toBe(250000);

    // Movimentação nessa conta muda o saldo
    await request(app)
      .post('/api/transactions')
      .set(authHeader(token))
      .send({ description: 'Depósito', amount: 500, type: 'INCOME', date: '2026-08-01', accountId: res.body.id });

    const list = await request(app).get('/api/accounts').set(authHeader(token));
    const acc = list.body.find((a) => a.id === res.body.id);
    expect(acc.balance).toBe(300000);
  });

  it('edita e exclui uma conta (movimentações permanecem)', async () => {
    const acc = await prisma.account.findFirst({ where: { userId: user.id, name: 'Poupança' } });

    const edited = await request(app)
      .put(`/api/accounts/${acc.id}`)
      .set(authHeader(token))
      .send({ name: 'Reserva' });
    expect(edited.status).toBe(200);
    expect(edited.body.name).toBe('Reserva');

    const txCount = await prisma.transaction.count({ where: { userId: user.id } });

    const del = await request(app).delete(`/api/accounts/${acc.id}`).set(authHeader(token));
    expect(del.status).toBe(200);

    // A movimentação continua existindo (sem conta)
    const after = await prisma.transaction.count({ where: { userId: user.id } });
    expect(after).toBe(txCount);
  });
});

describe('Compartilhamento', () => {
  let ownerToken;
  let guestToken;

  beforeAll(async () => {
    const owner = await createUser({ email: 'dono@finview.app' });
    ownerToken = owner.token;
    const guest = await createUser({ email: 'convidado@finview.app' });
    guestToken = guest.token;
  });

  it('dono convida e convidado aceita', async () => {
    const invite = await request(app)
      .post('/api/sharing/invite')
      .set(authHeader(ownerToken))
      .send({ email: 'convidado@finview.app' });

    expect(invite.status).toBe(201);

    const received = await request(app).get('/api/sharing').set(authHeader(guestToken));
    expect(received.body.received.length).toBe(1);
    expect(received.body.received[0].email).toBe('convidado@finview.app');

    const accepted = await request(app)
      .post(`/api/sharing/${invite.body.id}/accept`)
      .set(authHeader(guestToken));
    expect(accepted.status).toBe(200);
  });

  it('convidado passa a ver as categorias do dono', async () => {
    const guest = await prisma.user.findUnique({ where: { email: 'convidado@finview.app' } });
    const owner = await prisma.user.findUnique({ where: { email: 'dono@finview.app' } });

    // Dono cria uma categoria exclusiva
    await request(app)
      .post('/api/categories')
      .set(authHeader(ownerToken))
      .send({ name: 'Exclusiva do dono', icon: '⭐', color: '#f59e0b' });

    const guestView = await request(app).get('/api/categories').set(authHeader(guestToken));
    const names = guestView.body.map((c) => c.name);
    expect(names).toContain('Exclusiva do dono');
    expect(names).not.toContain('Sem categoria');
    expect(guest.id).not.toBe(owner.id);
  });

  it('dono pode revogar o compartilhamento', async () => {
    const sent = await request(app).get('/api/sharing').set(authHeader(ownerToken));
    const share = sent.body.active[0];
    const res = await request(app).delete(`/api/sharing/${share.id}`).set(authHeader(ownerToken));
    expect(res.status).toBe(200);
  });
});
