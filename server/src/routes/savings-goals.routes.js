import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { resolveScope } from '../services/scope.js';

const router = Router();
router.use(requireAuth);

// Se a meta estiver ligada a uma categoria, o "guardado" é a soma dos gastos dela
async function withComputedSaved(goal, scopeUserId) {
  if (!goal?.categoryId) return goal;
  const sum = await prisma.transaction.aggregate({
    where: { userId: scopeUserId, type: 'EXPENSE', categoryId: goal.categoryId },
    _sum: { amount: true },
  });
  return { ...goal, savedAmount: sum._sum.amount || 0 };
}

// Lista as metas personalizadas
router.get('/', async (req, res, next) => {
  try {
    const { effectiveUserId } = await resolveScope(req.user.id);
    const goals = await prisma.savingsGoal.findMany({ where: { userId: effectiveUserId }, orderBy: { createdAt: 'desc' } });
    const enriched = await Promise.all(goals.map((g) => withComputedSaved(g, effectiveUserId)));
    res.json(enriched);
  } catch (err) {
    next(err);
  }
});

// Cria uma meta (nome, valor total, já guardado, data alvo, categoria opcional)
router.post('/', async (req, res, next) => {
  try {
    const { effectiveUserId } = await resolveScope(req.user.id);
    const { name, targetAmount, savedAmount, targetDate, categoryId } = req.body || {};

    if (!name?.trim()) return res.status(400).json({ error: 'Dê um nome para a meta.' });
    const target = Math.round(Number(targetAmount) * 100);
    if (!Number.isFinite(target) || target <= 0) return res.status(400).json({ error: 'Informe o valor total da meta.' });

    let category = null;
    if (categoryId) {
      category = await prisma.category.findFirst({ where: { id: categoryId, userId: effectiveUserId } });
      if (!category) return res.status(400).json({ error: 'Categoria inválida.' });
    }

    const goal = await prisma.savingsGoal.create({
      data: {
        userId: effectiveUserId,
        name: name.trim(),
        targetAmount: target,
        savedAmount: Math.round(Number(savedAmount || 0) * 100) || 0,
        targetDate: targetDate ? new Date(targetDate) : null,
        categoryId: category?.id || null,
      },
    });
    res.status(201).json(await withComputedSaved(goal, effectiveUserId));
  } catch (err) {
    next(err);
  }
});

// Atualiza uma meta
router.put('/:id', async (req, res, next) => {
  try {
    const { effectiveUserId } = await resolveScope(req.user.id);
    const { name, targetAmount, savedAmount, targetDate, categoryId } = req.body || {};

    const existing = await prisma.savingsGoal.findFirst({ where: { id: req.params.id, userId: effectiveUserId } });
    if (!existing) return res.status(404).json({ error: 'Meta não encontrada.' });

    let category = null;
    if (categoryId !== undefined) {
      if (categoryId) {
        category = await prisma.category.findFirst({ where: { id: categoryId, userId: effectiveUserId } });
        if (!category) return res.status(400).json({ error: 'Categoria inválida.' });
      }
    } else {
      category = { id: existing.categoryId };
    }

    const updated = await prisma.savingsGoal.update({
      where: { id: existing.id },
      data: {
        name: name?.trim() || existing.name,
        targetAmount: targetAmount !== undefined ? Math.round(Number(targetAmount) * 100) : existing.targetAmount,
        savedAmount:
          savedAmount !== undefined && categoryId !== existing.categoryId
            ? Math.round(Number(savedAmount) * 100) || 0
            : existing.savedAmount,
        targetDate: targetDate !== undefined ? (targetDate ? new Date(targetDate) : null) : existing.targetDate,
        categoryId: category?.id ?? null,
      },
    });
    res.json(await withComputedSaved(updated, effectiveUserId));
  } catch (err) {
    next(err);
  }
});

// Exclui uma meta
router.delete('/:id', async (req, res, next) => {
  try {
    const { effectiveUserId } = await resolveScope(req.user.id);
    const deleted = await prisma.savingsGoal.deleteMany({ where: { id: req.params.id, userId: effectiveUserId } });
    if (deleted.count === 0) return res.status(404).json({ error: 'Meta não encontrada.' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
