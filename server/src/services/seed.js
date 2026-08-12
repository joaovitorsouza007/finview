import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { DEFAULT_CATEGORIES } from './categorize.js';

// Utilitários para gerar dados de exemplo
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

// Cria a conta demo (idempotente: recria do zero a cada execução)
export async function seedDemoUser() {
  const email = process.env.DEMO_EMAIL || 'demo@finview.app';
  const password = process.env.DEMO_PASSWORD || 'demo123';
  const passwordHash = await bcrypt.hash(password, 10);

  // Remove versões anteriores (cascade apaga categorias, metas e movimentações)
  await prisma.user.deleteMany({ where: { email } });

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: 'Conta demo',
      categories: { create: DEFAULT_CATEGORIES },
      goal: { create: { percent: 10 } },
    },
  });

  const created = await seedMockData(user.id);
  return { email, password, created };
}

// Cria 3 meses de movimentações realistas para o usuário testar o app
export async function seedMockData(userId) {
  const categories = await prisma.category.findMany({ where: { userId } });
  const byName = new Map(categories.map((c) => [c.name, c]));
  const cat = (name) => byName.get(name);

  const salary = cat('Salário');

  const expenseGroups = [
    {
      name: 'Alimentação',
      items: [['Supermercado', 120, 380], ['Padaria', 12, 40], ['Restaurante', 30, 120], ['Ifood', 25, 90]],
    },
    { name: 'Transporte', items: [['Uber', 15, 60], ['Combustível', 80, 220], ['Estacionamento', 10, 40]] },
    { name: 'Moradia', items: [['Aluguel', 1200, 1200], ['Conta de luz', 90, 210], ['Água', 40, 90], ['Internet', 99, 120]] },
    { name: 'Saúde', items: [['Farmácia', 20, 120], ['Consulta médica', 150, 350]] },
    { name: 'Lazer', items: [['Cinema', 40, 80], ['Netflix', 40, 60], ['Spotify', 20, 25], ['Show', 80, 250]] },
    { name: 'Compras', items: [['Amazon', 60, 250], ['Shopee', 40, 180], ['Loja de roupas', 90, 300]] },
    { name: 'Serviços', items: [['Telefonia', 45, 80], ['App de assinatura', 15, 40]] },
    { name: 'Educação', items: [['Curso online', 50, 200], ['Livros', 40, 120]] },
    { name: 'Investimentos', items: [['Aporte no tesouro', 200, 450], ['Aporte em FIIs', 100, 350]] },
  ];

  const txs = [];
  const today = new Date();

  for (let m = 2; m >= 0; m--) {
    const base = new Date(today.getFullYear(), today.getMonth() - m, 1);
    const daysInMonth = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();

    txs.push({
      description: 'Salário mensal',
      amount: 520000, // R$ 5.200,00
      type: 'INCOME',
      date: new Date(base.getFullYear(), base.getMonth(), 5),
      categoryId: salary?.id || null,
    });

    if (Math.random() > 0.5) {
      txs.push({
        description: 'Freelance / renda extra',
        amount: rand(200, 800) * 100,
        type: 'INCOME',
        date: new Date(base.getFullYear(), base.getMonth(), rand(15, daysInMonth)),
        categoryId: salary?.id || null,
      });
    }

    for (const group of expenseGroups) {
      const category = cat(group.name);
      const times = group.name === 'Investimentos' ? 1 : rand(2, 4);
      for (let i = 0; i < times; i++) {
        const [desc, min, max] = group.items[rand(0, group.items.length - 1)];
        txs.push({
          description: desc,
          amount: Math.round(randFloat(min, max) * 100),
          type: 'EXPENSE',
          date: new Date(base.getFullYear(), base.getMonth(), rand(1, daysInMonth)),
          categoryId: category?.id || null,
        });
      }
    }
  }

  // Remove dados de exemplo antigos antes de criar novos (evita duplicar)
  await prisma.transaction.deleteMany({ where: { userId, source: 'MOCK' } });
  await prisma.transaction.createMany({
    data: txs.map((t) => ({ ...t, userId, source: 'MOCK' })),
  });

  return txs.length;
}
