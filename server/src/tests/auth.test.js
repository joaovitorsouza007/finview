import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app, resetDb } from './helpers.js';
import { prisma } from '../lib/prisma.js';

beforeAll(async () => {
  await resetDb();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Autenticação', () => {
  it('cadastra um novo usuário e retorna token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'ana@finview.app', password: '123456' });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe('ana@finview.app');
  });

  it('rejeita e-mail duplicado', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'ana@finview.app', password: '123456' });

    expect(res.status).toBe(409);
  });

  it('faz login com credenciais corretas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ana@finview.app', password: '123456' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
  });

  it('rejeita senha incorreta', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ana@finview.app', password: 'senha-errada' });

    expect(res.status).toBe(401);
  });

  it('retorna os dados do usuário logado', async () => {
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ana@finview.app', password: '123456' });

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${login.body.token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('ana@finview.app');
  });
});
