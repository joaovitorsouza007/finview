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

describe('Onboarding', () => {
  let token;

  beforeAll(async () => {
    const u = await createUser({ email: 'novo@finview.app' });
    token = u.token;
  });

  it('usuário novo começa sem onboardedAt e com passo 0', async () => {
    const res = await request(app).get('/api/auth/me').set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.user.onboardingStep).toBe(0);
    expect(res.body.user.onboardedAt).toBeNull();
    expect(res.body.user.monthlyIncome).toBeNull();
  });

  it('salva o progresso e a renda informada', async () => {
    const res = await request(app)
      .put('/api/auth/onboarding')
      .set(authHeader(token))
      .send({ monthlyIncome: 5200, primaryGoal: 'investir', step: 2 });

    expect(res.status).toBe(200);
    expect(res.body.user.monthlyIncome).toBe(520000);
    expect(res.body.user.primaryGoal).toBe('investir');
    expect(res.body.user.onboardingStep).toBe(2);
    expect(res.body.user.onboardedAt).toBeNull();
  });

  it('ao concluir, marca onboardedAt e o passo 3', async () => {
    const res = await request(app)
      .put('/api/auth/onboarding')
      .set(authHeader(token))
      .send({ complete: true });

    expect(res.status).toBe(200);
    expect(res.body.user.onboardingStep).toBe(3);
    expect(res.body.user.onboardedAt).not.toBeNull();
  });
});
