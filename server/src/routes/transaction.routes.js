import { Router } from 'express';
import multer from 'multer';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { parseCsvBuffer } from '../utils/csv.js';
import { matchCategoryId } from '../services/categorize.js';
import { resolveScope } from '../services/scope.js';

const router = Router();
router.use(requireAuth);

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Converte valores como "R$ 1.234,56", "150,50" ou "45.90" para centavos
function toCents(value) {
  let s = String(value).replace(/R\$/gi, '').replace(/\s+/g, '').trim();
  const negative = s.startsWith('-');
  s = s.replace(/^-/, '');

  let num;
  if (s.includes(',')) {
    num = parseFloat(s.replace(/\./g, '').replace(',', '.'));
  } else {
    num = parseFloat(s);
  }
  if (Number.isNaN(num)) return null;

  const cents = Math.round(num * 100);
  return negative ? -cents : cents;
}

// Aceita datas em DD/MM/AAAA ou AAAA-MM-DD
function parseDate(value) {
  const s = String(value).trim();
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

const txSelect = {
  id: true,
  description: true,
  amount: true,
  type: true,
  date: true,
  source: true,
  categoryId: true,
  accountId: true,
  category: { select: { id: true, name: true, color: true, icon: true } },
  account: { select: { id: true, name: true, color: true, type: true } },
};

// Lista as movimentações do usuário (com filtro opcional por data)
router.get('/', async (req, res, next) => {
  try {
    const { effectiveUserId } = await resolveScope(req.user.id);
    const { from, to } = req.query;
    const where = { userId: effectiveUserId };
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(`${to}T23:59:59`);
    }

    const transactions = await prisma.transaction.findMany({
      where,
      select: txSelect,
      orderBy: { date: 'desc' },
      take: 200,
    });
    res.json(transactions);
  } catch (err) {
    next(err);
  }
});

// Cria uma movimentação manual (categoria auto-categorizada se não vier)
router.post('/', async (req, res, next) => {
  try {
    const { effectiveUserId } = await resolveScope(req.user.id);
    const { description, amount, type, date, categoryId, accountId } = req.body || {};
    if (!description?.trim()) return res.status(400).json({ error: 'Descreva a compra.' });

    const cents = toCents(amount);
    if (cents === null || cents <= 0) return res.status(400).json({ error: 'Informe um valor válido.' });

    const d = parseDate(date);
    if (!d) return res.status(400).json({ error: 'Informe uma data válida.' });

    // Sem categoria escolhida, o sistema sugere (regras do usuário > sistema > Outros)
    let finalCategoryId = categoryId || null;
    if (!finalCategoryId) {
      finalCategoryId = await matchCategoryId(effectiveUserId, description);
    }

    let account = null;
    if (accountId) {
      account = await prisma.account.findFirst({ where: { id: accountId, userId: effectiveUserId } });
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: effectiveUserId,
        description: description.trim(),
        amount: cents,
        type: type === 'INCOME' ? 'INCOME' : 'EXPENSE',
        date: d,
        source: 'MANUAL',
        categoryId: finalCategoryId,
        accountId: account?.id || null,
      },
      select: txSelect,
    });
    res.status(201).json(transaction);
  } catch (err) {
    next(err);
  }
});

// Atualiza uma movimentação existente
router.put('/:id', async (req, res, next) => {
  try {
    const { effectiveUserId } = await resolveScope(req.user.id);
    const { description, amount, type, date, categoryId, accountId } = req.body || {};

    const existing = await prisma.transaction.findFirst({
      where: { id: req.params.id, userId: effectiveUserId },
    });
    if (!existing) return res.status(404).json({ error: 'Movimentação não encontrada.' });

    const cents = amount !== undefined ? toCents(amount) : existing.amount;
    if (cents === null || cents <= 0) return res.status(400).json({ error: 'Informe um valor válido.' });

    const d = date !== undefined ? parseDate(date) : existing.date;
    if (!d) return res.status(400).json({ error: 'Informe uma data válida.' });

    let finalCategoryId = existing.categoryId;
    if (categoryId !== undefined) finalCategoryId = categoryId || null;

    let account = existing.accountId;
    if (accountId !== undefined) {
      account = null;
      if (accountId) {
        const acc = await prisma.account.findFirst({ where: { id: accountId, userId: effectiveUserId } });
        account = acc?.id || null;
      }
    }

    const updated = await prisma.transaction.update({
      where: { id: existing.id },
      data: {
        description: description?.trim() || existing.description,
        amount: cents,
        type: type === 'INCOME' || type === 'EXPENSE' ? type : existing.type,
        date: d,
        categoryId: finalCategoryId,
        accountId: account,
      },
      select: txSelect,
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// Remove uma movimentação
router.delete('/:id', async (req, res, next) => {
  try {
    const { effectiveUserId } = await resolveScope(req.user.id);
    const deleted = await prisma.transaction.deleteMany({
      where: { id: req.params.id, userId: effectiveUserId },
    });
    if (deleted.count === 0) return res.status(404).json({ error: 'Movimentação não encontrada.' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// Importa movimentações a partir de um arquivo CSV
router.post('/import', upload.single('file'), async (req, res, next) => {
  try {
    const { effectiveUserId } = await resolveScope(req.user.id);
    if (!req.file) return res.status(400).json({ error: 'Envie um arquivo CSV.' });

    const rows = await parseCsvBuffer(req.file.buffer);
    const categories = await prisma.category.findMany({ where: { userId: effectiveUserId } });
    const byName = new Map(categories.map((c) => [c.name.toLowerCase(), c]));
    const matchByName = (name) => byName.get(String(name || '').trim().toLowerCase());

    let created = 0;
    let skipped = 0;

    for (const row of rows) {
      const cents = toCents(row.valor ?? row.amount);
      if (cents === null || cents === 0) {
        skipped++;
        continue;
      }
      const d = parseDate(row.data ?? row.date);
      if (!d) {
        skipped++;
        continue;
      }

      // Tipo: coluna "tipo" tem prioridade; senão, valor negativo = entrada
      const rawType = String(row.tipo ?? row.type ?? '').toUpperCase();
      const type =
        rawType === 'INCOME' || rawType === 'RECEITA' || rawType === 'R'
          ? 'INCOME'
          : cents < 0
            ? 'INCOME'
            : 'EXPENSE';
      const amount = Math.abs(cents);

      const description = String(row.descricao ?? row.description ?? '').trim() || 'Sem descrição';

      // Categoria: coluna do CSV, regra do usuário ou categorização automática
      let category = matchByName(row.categoria ?? row.category);
      let categoryId = category?.id || null;
      if (!categoryId) {
        categoryId = await matchCategoryId(effectiveUserId, description);
      }

      await prisma.transaction.create({
        data: {
          userId: effectiveUserId,
          description,
          amount,
          type,
          date: d,
          source: 'CSV',
          categoryId,
        },
      });
      created++;
    }

    res.json({ created, skipped });
  } catch (err) {
    next(err);
  }
});

export default router;
