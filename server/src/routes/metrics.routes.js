import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getMetrics } from '../services/metrics.js';
import { resolveScope } from '../services/scope.js';

const router = Router();
router.use(requireAuth);

// Dados do dashboard: resumo, comparativo, gastos por categoria, evolução de
// saldo, série mensal, saldo por conta e meta de investimento
router.get('/', async (req, res, next) => {
  try {
    const { effectiveUserId } = await resolveScope(req.user.id);
    const data = await getMetrics(effectiveUserId, {
      period: req.query.period,
      categoryId: req.query.categoryId || null,
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
