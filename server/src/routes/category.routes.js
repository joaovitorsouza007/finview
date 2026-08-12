import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { resolveScope } from '../services/scope.js';

const router = Router();
router.use(requireAuth);

// Lista as categorias do usuário (com quantidade de movimentações)
router.get('/', async (req, res, next) => {
  try {
    const { effectiveUserId } = await resolveScope(req.user.id);
    const categories = await prisma.category.findMany({
      where: { userId: effectiveUserId },
      orderBy: { name: 'asc' },
      include: { _count: { select: { transactions: true } } },
    });
    res.json(categories);
  } catch (err) {
    next(err);
  }
});

// Cria uma nova categoria
router.post('/', async (req, res, next) => {
  try {
    const { effectiveUserId } = await resolveScope(req.user.id);
    const { name, color, icon } = req.body || {};
    if (!name?.trim()) return res.status(400).json({ error: 'Informe o nome da categoria.' });

    const category = await prisma.category.create({
      data: {
        userId: effectiveUserId,
        name: name.trim(),
        color: color || '#6b7280',
        icon: icon || '',
        isIncome: false,
        isInvestment: false,
      },
    });
    res.status(201).json(category);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Esta categoria já existe.' });
    next(err);
  }
});

// Atualiza nome, ícone e cor de uma categoria existente
router.put('/:id', async (req, res, next) => {
  try {
    const { effectiveUserId } = await resolveScope(req.user.id);
    const { name, color, icon } = req.body || {};

    const category = await prisma.category.findFirst({
      where: { id: req.params.id, userId: effectiveUserId },
    });
    if (!category) return res.status(404).json({ error: 'Categoria não encontrada.' });

    // A categoria padrão "Outros" não pode ser renomeada (é usada na reatribuição)
    if (category.name === 'Outros' && name?.trim() && name.trim() !== 'Outros') {
      return res.status(400).json({ error: 'A categoria padrão Outros não pode ser renomeada.' });
    }

    const updated = await prisma.category.update({
      where: { id: category.id },
      data: {
        name: name?.trim() ? name.trim() : category.name,
        color: color || category.color,
        icon: icon !== undefined ? icon : category.icon,
      },
    });
    res.json(updated);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Esta categoria já existe.' });
    next(err);
  }
});

// Exclui uma categoria e reatribui as movimentações para a padrão "Outros"
router.delete('/:id', async (req, res, next) => {
  try {
    const { effectiveUserId } = await resolveScope(req.user.id);
    const category = await prisma.category.findFirst({
      where: { id: req.params.id, userId: effectiveUserId },
    });
    if (!category) return res.status(404).json({ error: 'Categoria não encontrada.' });
    if (category.name === 'Outros') {
      return res.status(400).json({ error: 'A categoria Outros é usada como padrão e não pode ser excluída.' });
    }

    let outros = await prisma.category.findFirst({ where: { userId: effectiveUserId, name: 'Outros' } });
    if (!outros) {
      outros = await prisma.category.create({
        data: { userId: effectiveUserId, name: 'Outros', color: '#6b7280', icon: '📦', isIncome: false, isInvestment: false },
      });
    }

    // Reatribui as movimentações antes de excluir
    await prisma.transaction.updateMany({
      where: { userId: effectiveUserId, categoryId: category.id },
      data: { categoryId: outros.id },
    });
    await prisma.category.delete({ where: { id: category.id } });

    res.json({ ok: true, reassignedTo: outros.name });
  } catch (err) {
    next(err);
  }
});

export default router;
