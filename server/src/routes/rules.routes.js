import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { matchCategoryId } from '../services/categorize.js';

const router = Router();
router.use(requireAuth);

// Sugere a categoria provável para uma descrição (usado no modal de movimentação)
router.get('/suggest', async (req, res, next) => {
  try {
    const description = req.query.description || '';
    const categoryId = await matchCategoryId(req.user.id, description);
    const category = categoryId
      ? await prisma.category.findFirst({ where: { id: categoryId, userId: req.user.id } })
      : null;
    res.json({ categoryId: category?.id || null, categoryName: category?.name || null, icon: category?.icon || null });
  } catch (err) {
    next(err);
  }
});

// Lista as regras do usuário (com o nome/ícone da categoria)
router.get('/', async (req, res, next) => {
  try {
    const rules = await prisma.rule.findMany({
      where: { userId: req.user.id },
      include: { category: { select: { id: true, name: true, icon: true, color: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(rules);
  } catch (err) {
    next(err);
  }
});

// Cria uma regra: "se a descrição contém [keyword] → categoria [categoryId]"
router.post('/', async (req, res, next) => {
  try {
    const { keyword, categoryId } = req.body || {};
    const k = String(keyword || '').trim().toLowerCase();
    if (!k) return res.status(400).json({ error: 'Informe uma palavra-chave.' });

    const category = await prisma.category.findFirst({ where: { id: categoryId, userId: req.user.id } });
    if (!category) return res.status(400).json({ error: 'Escolha uma categoria válida.' });

    const rule = await prisma.rule.upsert({
      where: { userId_keyword: { userId: req.user.id, keyword: k } },
      update: { categoryId },
      create: { userId: req.user.id, keyword: k, categoryId },
      include: { category: { select: { id: true, name: true, icon: true, color: true } } },
    });
    res.status(201).json(rule);
  } catch (err) {
    next(err);
  }
});

// Exclui uma regra
router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await prisma.rule.deleteMany({ where: { id: req.params.id, userId: req.user.id } });
    if (deleted.count === 0) return res.status(404).json({ error: 'Regra não encontrada.' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
