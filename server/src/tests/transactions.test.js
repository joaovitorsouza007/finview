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

describe('Transações', () => {
  let token;
  let user;

  beforeAll(async () => {
    const u = await createUser({ email: 'bob@finview.app' });
    token = u.token;
    user = await prisma.user.findUnique({ where: { email: 'bob@finview.app' } });
  });

  it('exige autenticação', async () => {
    const res = await request(app).get('/api/transactions');
    expect(res.status).toBe(401);
  });

  it('cria uma movimentação (valor em reais vira centavos)', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set(authHeader(token))
      .send({ description: 'Supermercado', amount: 150.5, type: 'EXPENSE', date: '2026-08-01' });

    expect(res.status).toBe(201);
    expect(res.body.amount).toBe(15050);
    expect(res.body.type).toBe('EXPENSE');
  });

  it('rejeita movimentação sem valor', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set(authHeader(token))
      .send({ description: 'Sem valor', type: 'EXPENSE', date: '2026-08-01' });

    expect(res.status).toBe(400);
  });

  it('lista as movimentações', async () => {
    const res = await request(app).get('/api/transactions').set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('importa um CSV com categorização automática', async () => {
    const csv = [
      'data,descricao,categoria,valor,tipo',
      '02/08/2026,Netflix,Lazer,"45,90",EXPENSE',
      '03/08/2026,Salário,,"5500,00",INCOME',
      '04/08/2026,Remédio na farmácia,,"35,50",EXPENSE',
    ].join('\n');

    const res = await request(app)
      .post('/api/transactions/import')
      .set(authHeader(token))
      .attach('file', Buffer.from(csv), 'extrato.csv');

    expect(res.status).toBe(200);
    expect(res.body.created).toBe(3);

    // "Remédio na farmácia" deve ser categorizado automaticamente como Saúde
    const remedio = await prisma.transaction.findFirst({
      where: { userId: user.id, description: 'Remédio na farmácia' },
      include: { category: true },
    });
    expect(remedio.category.name).toBe('Saúde');
  });

  it('importa um CSV no padrão do extrato do Nubank', async () => {
    const csv = [
      'Data,Valor,Identificador,Descrição',
      '01/08/2026,66.73,6a6e1e8b-0001,Transferência recebida pelo Pix',
      '02/08/2026,-1.89,6a6fba4d-0002,Compra no débito via NuPay - iFood',
      '03/08/2026,-426.00,6a775fe3-0003,Pagamento de fatura',
    ].join('\n');

    const res = await request(app)
      .post('/api/transactions/import')
      .set(authHeader(token))
      .attach('file', Buffer.from(csv), 'nu_extrato.csv');

    expect(res.status).toBe(200);
    expect(res.body.created).toBe(3);

    const receita = await prisma.transaction.findFirst({
      where: { userId: user.id, externalId: '6a6e1e8b-0001' },
    });
    expect(receita.type).toBe('INCOME');
    expect(receita.amount).toBe(6673);
    expect(receita.date).toEqual(new Date(2026, 7, 1));

    const despesa = await prisma.transaction.findFirst({
      where: { userId: user.id, externalId: '6a6fba4d-0002' },
    });
    expect(despesa.type).toBe('EXPENSE');
    expect(despesa.amount).toBe(189);

    // Importar o mesmo arquivo de novo não duplica (usa o Identificador)
    const res2 = await request(app)
      .post('/api/transactions/import')
      .set(authHeader(token))
      .attach('file', Buffer.from(csv), 'nu_extrato.csv');
    expect(res2.status).toBe(200);
    expect(res2.body.created).toBe(0);
    expect(res2.body.skipped).toBe(3);
  });

  it('remove uma movimentação', async () => {
    const t = await prisma.transaction.findFirst({ where: { userId: user.id } });
    const res = await request(app).delete(`/api/transactions/${t.id}`).set(authHeader(token));
    expect(res.status).toBe(200);
  });

  it('atualiza uma movimentação (descrição, valor e tipo)', async () => {
    const t = await prisma.transaction.findFirst({ where: { userId: user.id } });

    // Cria uma movimentação de referência para editar
    const created = await request(app)
      .post('/api/transactions')
      .set(authHeader(token))
      .send({ description: 'Ajuste', amount: 100, type: 'EXPENSE', date: '2026-08-05' });
    expect(created.status).toBe(201);

    const res = await request(app)
      .put(`/api/transactions/${created.body.id}`)
      .set(authHeader(token))
      .send({ description: 'Ajuste corrigido', amount: 200.9, type: 'INCOME' });

    expect(res.status).toBe(200);
    expect(res.body.description).toBe('Ajuste corrigido');
    expect(res.body.amount).toBe(20090);
    expect(res.body.type).toBe('INCOME');
    expect(t).toBeTruthy();
  });

  it('limpa todas as movimentações apenas com a senha correta', async () => {
    // Sem senha
    const noPass = await request(app)
      .delete('/api/transactions/clear')
      .set(authHeader(token))
      .send({});
    expect(noPass.status).toBe(400);

    // Senha errada
    const wrongPass = await request(app)
      .delete('/api/transactions/clear')
      .set(authHeader(token))
      .send({ password: 'senha-errada' });
    expect(wrongPass.status).toBe(403);

    const before = await prisma.transaction.count({ where: { userId: user.id } });
    expect(before).toBeGreaterThan(0);

    // Senha correta apaga tudo
    const ok = await request(app)
      .delete('/api/transactions/clear')
      .set(authHeader(token))
      .send({ password: '123456' });
    expect(ok.status).toBe(200);
    expect(ok.body.deleted).toBe(before);

    const after = await prisma.transaction.count({ where: { userId: user.id } });
    expect(after).toBe(0);
  });
});
