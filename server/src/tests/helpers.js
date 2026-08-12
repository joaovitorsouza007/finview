import request from 'supertest';
import { createApp } from '../app.js';
import { prisma } from '../lib/prisma.js';

// Aplicação pronta para os testes (sem listen)
export const app = createApp();

// Limpa todas as tabelas antes de cada teste
export async function resetDb() {
  await prisma.transaction.deleteMany();
  await prisma.category.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.user.deleteMany();
}

// Cria um usuário e devolve o token de acesso
export async function createUser(overrides = {}) {
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      email: overrides.email || 'user@finview.app',
      password: overrides.password || '123456',
      name: 'Usuário Teste',
    });
  return res.body; // { token, user }
}

export function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}
