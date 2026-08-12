import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { generateAlerts } from '../services/alerts.js';

const router = Router();
router.use(requireAuth);

// Lista as notificações (mais recentes primeiro)
router.get('/', async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(notifications);
  } catch (err) {
    next(err);
  }
});

// Roda a checagem de alertas e devolve os novos + não lidas
router.post('/check', async (req, res, next) => {
  try {
    const created = await generateAlerts(req.user.id);
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ created, notifications });
  } catch (err) {
    next(err);
  }
});

// Marca uma notificação como lida
router.patch('/:id/read', async (req, res, next) => {
  try {
    const updated = await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user.id },
      data: { read: true },
    });
    if (updated.count === 0) return res.status(404).json({ error: 'Notificação não encontrada.' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// Marca todas como lidas
router.post('/read-all', async (req, res, next) => {
  try {
    await prisma.notification.updateMany({ where: { userId: req.user.id }, data: { read: true } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
