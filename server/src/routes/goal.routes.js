import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { resolveScope } from '../services/scope.js';

const router = Router();
router.use(requireAuth);

// Busca a meta de investimento do usuário
router.get('/', async (req, res, next) => {
  try {
    const { effectiveUserId } = await resolveScope(req.user.id);
    const goal = await prisma.goal.findUnique({ where: { userId: effectiveUserId } });
    res.json({ percent: goal?.percent ?? 10 });
  } catch (err) {
    next(err);
  }
});

// Atualiza o percentual da meta (0 a 100)
router.put('/', async (req, res, next) => {
  try {
    const { effectiveUserId } = await resolveScope(req.user.id);
    const percent = Number(req.body?.percent);
    if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
      return res.status(400).json({ error: 'Informe um percentual entre 0 e 100.' });
    }

    const goal = await prisma.goal.upsert({
      where: { userId: effectiveUserId },
      update: { percent },
      create: { userId: effectiveUserId, percent },
    });

    res.json({ percent: goal.percent });
  } catch (err) {
    next(err);
  }
});

export default router;
