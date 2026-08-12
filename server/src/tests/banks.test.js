import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app, resetDb, createUser, authHeader } from './helpers.js';
import { prisma } from '../lib/prisma.js';

// Modo demonstração: sem PLUGGY_CLIENT_ID/SECRET, o serviço gera dados
// fictícios — o que permite testar todo o fluxo sem credenciais externas.

beforeAll(async () => {
  await resetDb();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Bancos conectados (Open Banking)', () => {
  let token;

  beforeAll(async () => {
    const u = await createUser({ email: 'bancos@finview.app' });
    token = u.token;
  });

  it('lista bancos disponíveis para conexão', async () => {
    const res = await request(app).get('/api/banks/available').set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.demoMode).toBe(true);
    expect(res.body.institutions.length).toBeGreaterThan(0);
    expect(res.body.institutions.some((b) => b.id === 'nubank')).toBe(true);
  });

  it('filtra a busca de bancos', async () => {
    const res = await request(app).get('/api/banks/available?search=itau').set(authHeader(token));
    expect(res.body.institutions.length).toBe(1);
    expect(res.body.institutions[0].id).toBe('itau');
  });

  it('inicia a conexão e devolve a URL segura', async () => {
    const res = await request(app)
      .post('/api/banks/connect')
      .set(authHeader(token))
      .send({ institutionId: 'nubank' });
    expect(res.status).toBe(200);
    expect(res.body.authUrl).toContain('/bancos/demo-auth');
    expect(res.body.connectionId).toBeTruthy();
  });

  it('finaliza a conexão (claim) e sincroniza transações sem duplicar', async () => {
    // 1) Abre a conexão
    const connect = await request(app)
      .post('/api/banks/connect')
      .set(authHeader(token))
      .send({ institutionId: 'bradesco' });
    const ref = connect.body.connectionId;

    // 2) Usuário volta do banco com o item autorizado
    const claim = await request(app)
      .post('/api/banks/claim')
      .set(authHeader(token))
      .send({ itemId: 'item-bradesco-1', ref });
    expect(claim.status).toBe(200);
    expect(claim.body.connection.status).toBe('ACTIVE');
    expect(claim.body.connection.institutionName).toBe('Bradesco');

    // 3) Sincronização manual importa as transações
    const sync = await request(app)
      .post(`/api/banks/${claim.body.connection.id}/sync`)
      .set(authHeader(token));
    expect(sync.status).toBe(200);
    expect(sync.body.created).toBeGreaterThan(0);
    expect(sync.body.accounts.length).toBeGreaterThan(0);
    expect(sync.body.connection.status).toBe('ACTIVE');

    const user = await prisma.user.findUnique({ where: { email: 'bancos@finview.app' } });
    const total = await prisma.transaction.count({ where: { userId: user.id, source: 'BANK' } });
    expect(total).toBe(sync.body.created);

    // 4) Segunda sincronização: atualiza, não duplica
    const sync2 = await request(app)
      .post(`/api/banks/${claim.body.connection.id}/sync`)
      .set(authHeader(token));
    expect(sync2.status).toBe(200);
    expect(sync2.body.created).toBe(0);
    expect(sync2.body.updated).toBe(sync.body.created);
    const total2 = await prisma.transaction.count({ where: { userId: user.id, source: 'BANK' } });
    expect(total2).toBe(total);

    // 5) Lista de bancos conectados mostra a conexão
    const list = await request(app).get('/api/banks').set(authHeader(token));
    const conn = list.body.find((c) => c.id === claim.body.connection.id);
    expect(conn).toBeTruthy();
    expect(conn.status).toBe('ACTIVE');
    expect(conn.balance).toBeGreaterThan(0);
    expect(conn.transactionCount).toBe(total);
  });

  it('transações importadas aparecem no histórico do banco com categoria', async () => {
    const list = await request(app).get('/api/banks').set(authHeader(token));
    const conn = list.body.find((c) => c.institution === 'bradesco');
    const tx = await request(app).get(`/api/banks/${conn.id}/transactions`).set(authHeader(token));
    expect(tx.status).toBe(200);
    expect(tx.body.length).toBeGreaterThan(0);
    // Todo lançamento tem descrição e categoria definida (mapeada ou "Outros")
    expect(tx.body.every((t) => t.description && t.category)).toBe(true);
  });

  it('webhook do Pluggy sincroniza transações automaticamente', async () => {
    const list = await request(app).get('/api/banks').set(authHeader(token));
    const conn = list.body.find((c) => c.institution === 'bradesco');
    const before = await prisma.transaction.count({ where: { bankConnectionId: conn.id } });

    const res = await request(app)
      .post('/api/banks/webhook')
      .send({ event: 'UPDATED_TRANSACTIONS', data: { itemId: 'item-bradesco-1' } });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);

    // O webhook sincroniza em background; aguarda o lastSync avançar (com
    // tolerância para o Postgres remoto) antes de conferir a contagem.
    const deadline = Date.now() + 20000;
    let synced = false;
    while (Date.now() < deadline) {
      const row = await prisma.bankConnection.findUnique({ where: { id: conn.id } });
      if (row.lastSync && (!conn.lastSync || row.lastSync.getTime() > new Date(conn.lastSync).getTime())) {
        synced = true;
        break;
      }
      await new Promise((r) => setTimeout(r, 250));
    }
    expect(synced).toBe(true); // o webhook disparou a sincronização

    const after = await prisma.transaction.count({ where: { bankConnectionId: conn.id } });
    expect(after).toBe(before); // sem duplicar
  });

  it('desconecta o banco mantendo as transações importadas', async () => {
    const list = await request(app).get('/api/banks').set(authHeader(token));
    const conn = list.body.find((c) => c.institution === 'bradesco');
    const kept = await prisma.transaction.count({ where: { bankConnectionId: conn.id } });

    const del = await request(app).delete(`/api/banks/${conn.id}`).set(authHeader(token));
    expect(del.status).toBe(200);

    // Sumiu da lista de bancos conectados, mas as transações continuam
    const list2 = await request(app).get('/api/banks').set(authHeader(token));
    expect(list2.body.some((c) => c.id === conn.id)).toBe(false);
    const kept2 = await prisma.transaction.count({ where: { bankConnectionId: conn.id } });
    expect(kept2).toBe(kept);
  });

  it('exige login em todas as rotas de bancos', async () => {
    const res = await request(app).get('/api/banks');
    expect(res.status).toBe(401);
  });
});
