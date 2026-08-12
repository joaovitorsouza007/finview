import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { resolveScope } from '../services/scope.js';

const router = Router();
router.use(requireAuth);

// Saldo de uma conta = saldo inicial + entradas - saídas
async function withBalance(account, scopeUserId) {
  const agg = await prisma.transaction.aggregate({
    where: { userId: scopeUserId, accountId: account.id },
    _sum: { amount: true },
  });
  let balance = account.initialBalance;
  if (agg._sum.amount) balance += agg._sum.amount;
  return { ...account, balance };
}

// Lista as contas com saldo atual
router.get('/', async (req, res, next) => {
  try {
    const { effectiveUserId } = await resolveScope(req.user.id);
    const accounts = await prisma.account.findMany({
      where: { userId: effectiveUserId },
      orderBy: { createdAt: 'asc' },
    });
    const enriched = await Promise.all(accounts.map((a) => withBalance(a, effectiveUserId)));
    res.json(enriched);
  } catch (err) {
    next(err);
  }
});

// Cria uma conta (nome, tipo, saldo inicial, cor)
router.post('/', async (req, res, next) => {
  try {
    const { effectiveUserId } = await resolveScope(req.user.id);
    const { name, type, initialBalance, color } = req.body || {};
    if (!name?.trim()) return res.status(400).json({ error: 'Dê um nome para a conta.' });

    const account = await prisma.account.create({
      data: {
        userId: effectiveUserId,
        name: name.trim(),
        type: type || 'checking',
        color: color || '#059669',
        initialBalance: Math.round(Number(initialBalance || 0) * 100) || 0,
      },
    });
    res.status(201).json(await withBalance(account, effectiveUserId));
  } catch (err) {
    next(err);
  }
});

// Atualiza uma conta
router.put('/:id', async (req, res, next) => {
  try {
    const { effectiveUserId } = await resolveScope(req.user.id);
    const { name, type, initialBalance, color } = req.body || {};

    const existing = await prisma.account.findFirst({ where: { id: req.params.id, userId: effectiveUserId } });
    if (!existing) return res.status(404).json({ error: 'Conta não encontrada.' });

    const updated = await prisma.account.update({
      where: { id: existing.id },
      data: {
        name: name?.trim() || existing.name,
        type: type || existing.type,
        color: color || existing.color,
        initialBalance: initialBalance !== undefined ? Math.round(Number(initialBalance) * 100) : existing.initialBalance,
      },
    });
    res.json(await withBalance(updated, effectiveUserId));
  } catch (err) {
    next(err);
  }
});

// Exclui uma conta (movimentações ficam sem conta, não são apagadas)
router.delete('/:id', async (req, res, next) => {
  try {
    const { effectiveUserId } = await resolveScope(req.user.id);
    const deleted = await prisma.account.deleteMany({ where: { id: req.params.id, userId: effectiveUserId } });
    if (deleted.count === 0) return res.status(404).json({ error: 'Conta não encontrada.' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
