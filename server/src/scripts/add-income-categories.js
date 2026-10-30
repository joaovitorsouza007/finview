import 'dotenv/config';
import { prisma } from '../lib/prisma.js';

// Adiciona categorias de receita que não existem ainda para cada usuário
const INCOME_CATEGORIES = [
  { name: 'Renda fixa', color: '#0ea5e9', icon: '🏦', isIncome: true, isInvestment: false },
  { name: 'Renda variável', color: '#f97316', icon: '📊', isIncome: true, isInvestment: false },
];

async function main() {
  const users = await prisma.user.findMany({ select: { id: true } });
  let added = 0;

  for (const user of users) {
    for (const cat of INCOME_CATEGORIES) {
      const exists = await prisma.category.findFirst({
        where: { userId: user.id, name: cat.name },
      });
      if (!exists) {
        await prisma.category.create({ data: { ...cat, userId: user.id } });
        added++;
      }
    }
  }

  console.log(`Categorias de receita adicionadas: ${added}`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
