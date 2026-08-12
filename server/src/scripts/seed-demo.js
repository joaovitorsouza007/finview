// Cria a conta demo com dados de exemplo (executar uma vez após o setup)
import 'dotenv/config';
import { prisma } from '../lib/prisma.js';
import { seedDemoUser } from '../services/seed.js';

try {
  const { email, password, created } = await seedDemoUser();
  console.log(`Conta demo criada: ${email} / ${password} (${created} movimentações)`);
} catch (err) {
  console.error('Falha ao criar a conta demo:', err.message);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
